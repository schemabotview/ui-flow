import {
  siApachekafka, siApachespark, siApacheairflow, siApacheflink, siApachehadoop, siApachehive, siApacheparquet,
  siApachecassandra, siPython, siPandas, siNumpy, siJupyter, siPytorch, siTensorflow, siScikitlearn, siFastapi,
  siFlask, siDjango, siOpenjdk, siScala, siLinux, siUbuntu, siGnubash, siDocker, siKubernetes, siNginx, siPostgresql,
  siSqlite, siDuckdb, siMongodb, siElasticsearch, siRabbitmq, siSnowflake, siGit, siGithub, siGithubactions,
  siTerraform, siAnsible, siJenkins, siPrometheus,
} from 'simple-icons'

export interface BrandIcon {
  title: string
  hex: string
  path: string
}

export const BRAND_ICONS: Record<string, BrandIcon> = {
  kafka: siApachekafka,
  spark: siApachespark,
  airflow: siApacheairflow,
  flink: siApacheflink,
  hadoop: siApachehadoop,
  hive: siApachehive,
  parquet: siApacheparquet,
  cassandra: siApachecassandra,
  python: siPython,
  pandas: siPandas,
  numpy: siNumpy,
  jupyter: siJupyter,
  pytorch: siPytorch,
  tensorflow: siTensorflow,
  sklearn: siScikitlearn,
  fastapi: siFastapi,
  flask: siFlask,
  django: siDjango,
  java: siOpenjdk,
  scala: siScala,
  linux: siLinux,
  ubuntu: siUbuntu,
  bash: siGnubash,
  docker: siDocker,
  kubernetes: siKubernetes,
  nginx: siNginx,
  postgresql: siPostgresql,
  sqlite: siSqlite,
  duckdb: siDuckdb,
  mongodb: siMongodb,
  elasticsearch: siElasticsearch,
  rabbitmq: siRabbitmq,
  snowflakedb: siSnowflake,
  git: siGit,
  github: siGithub,
  githubactions: siGithubactions,
  terraform: siTerraform,
  ansible: siAnsible,
  jenkins: siJenkins,
  prometheus: siPrometheus,
}

const luminance = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

export const BRAND_MIN_CONTRAST = 2.2

export function brandFill(hex: string, surface: string, ink: string): string {
  const a = luminance(`#${hex}`)
  const b = luminance(surface)
  const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  return contrast < BRAND_MIN_CONTRAST ? ink : `#${hex}`
}
