import { NavBar } from './NavBar'
import { Icon } from './Icon'

export function PageHeader({ title, more = false }: { title: string; more?: boolean }) {
  return <NavBar title={title} showBack right={more ? <Icon name="more" /> : undefined} />
}
