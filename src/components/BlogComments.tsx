import Giscus from '@giscus/react'

export function BlogComments({ slug }: { slug: string }) {
  return (
    <Giscus
      key={slug}
      repo="forkzero/forkzero.ai"
      repoId="R_kgDORLeYLw"
      category="Blog Comments"
      categoryId="" /* TODO: Enable Discussions, create "Blog Comments" category, get ID from https://giscus.app */
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang="en"
      loading="lazy"
    />
  )
}
