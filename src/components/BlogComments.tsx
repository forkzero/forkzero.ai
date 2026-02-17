import Giscus from '@giscus/react'

export function BlogComments({ slug }: { slug: string }) {
  return (
    <Giscus
      key={slug}
      repo="forkzero/forkzero.ai"
      repoId="R_kgDORLeYLw"
      category="Blog Comments"
      categoryId="DIC_kwDORLeYL84C2H-a"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="dark"
      lang="en"
      loading="lazy"
    />
  )
}
