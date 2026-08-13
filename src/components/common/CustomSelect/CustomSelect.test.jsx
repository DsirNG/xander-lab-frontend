import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CustomSelect from './index';

const options = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
];

describe('CustomSelect', () => {
  it('portals the menu outside a clipping parent', async () => {
    render(
      <div data-testid="clipping-parent" style={{ overflowY: 'auto' }}>
        <CustomSelect options={options} value="one" onChange={() => {}} placeholder="Choose" />
      </div>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    vi.spyOn(trigger.parentElement, 'getBoundingClientRect').mockReturnValue({
      left: 120, top: 160, right: 320, bottom: 202, width: 200, height: 42,
    });
    vi.spyOn(screen.getByTestId('clipping-parent'), 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 80, right: 600, bottom: 500, width: 600, height: 420,
    });

    fireEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');

    await waitFor(() => expect(listbox.parentElement).toHaveStyle({ left: '120px', width: '200px' }));
    expect(screen.getByTestId('clipping-parent')).not.toContainElement(listbox);
    expect(document.body).toContainElement(listbox);
  });

  it('selects from the portal and closes on outside click', async () => {
    const onChange = vi.fn();
    render(<CustomSelect options={options} value="one" onChange={onChange} placeholder="Choose" />);
    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    vi.spyOn(trigger.parentElement, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, right: 200, bottom: 42, width: 200, height: 42,
    });

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole('option', { name: 'Two' }));
    expect(onChange).toHaveBeenCalledWith('two');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    await screen.findByRole('listbox');
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
