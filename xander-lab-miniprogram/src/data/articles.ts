export type Article = { id:string; title:string; excerpt:string; tags:string[]; date:string; views:string; art:'deploy'|'vue'|'ai'|'flow'|'shield'|'design' }
export const articles: Article[] = [
  {id:'deploy',title:'前端工程化实践：从提交到部署',excerpt:'从代码提交到生产部署的完整流程与实践总结，结合 Git、CI/CD 与自动化工具链。',tags:['工程化','CI/CD'],date:'2024-05-20',views:'1.2k',art:'deploy'},
  {id:'vue',title:'Vue3 性能优化的几个关键点',excerpt:'深入响应式原理，实战常见性能优化策略与最佳实践。',tags:['Vue'],date:'2024-05-18',views:'982',art:'vue'},
  {id:'ai',title:'大模型时代的前端 AI 应用探索',excerpt:'从体验到落地，探索前端与大模型结合的可能性与实现路径。',tags:['AI','前端'],date:'2024-05-16',views:'756',art:'ai'},
  {id:'flow',title:'从 0 到 1 搭建前端 CI/CD 流程',excerpt:'使用 GitHub Actions 搭建高效、稳定的自动化部署流程。',tags:['工程化','CI/CD'],date:'2024-05-15',views:'642',art:'flow'},
  {id:'shield',title:'前端安全最佳实践总结',excerpt:'XSS、CSRF、防劫持等常见安全问题与防护方案总结。',tags:['安全','前端'],date:'2024-05-14',views:'531',art:'shield'},
]
