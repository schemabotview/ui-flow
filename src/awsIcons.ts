// Registry of official AWS service icons (from `aws-react-icons`, the AWS Architecture Icon set).
// A SceneNode references one by key via `icon: 'ec2'`; SceneNode/ContainerNode render it in place of
// the pattern's default lucide glyph. Imported individually (per-file subpath) so only the icons we
// actually use are bundled.

import type { ComponentType } from 'react'
import EC2 from 'aws-react-icons/icons/ArchitectureServiceAmazonEC2'
import Lambda from 'aws-react-icons/icons/ArchitectureServiceAWSLambda'
import S3 from 'aws-react-icons/icons/ArchitectureServiceAmazonSimpleStorageService'
import EBS from 'aws-react-icons/icons/ArchitectureServiceAmazonElasticBlockStore'
import RDS from 'aws-react-icons/icons/ArchitectureServiceAmazonRDS'
import DynamoDB from 'aws-react-icons/icons/ArchitectureServiceAmazonDynamoDB'
import VPC from 'aws-react-icons/icons/ArchitectureServiceAmazonVirtualPrivateCloud'
import CloudFront from 'aws-react-icons/icons/ArchitectureServiceAmazonCloudFront'
import IAM from 'aws-react-icons/icons/ArchitectureServiceAWSIdentityandAccessManagement'
import Beanstalk from 'aws-react-icons/icons/ArchitectureServiceAWSElasticBeanstalk'
import ECS from 'aws-react-icons/icons/ArchitectureServiceAmazonElasticContainerService'
import Fargate from 'aws-react-icons/icons/ArchitectureServiceAWSFargate'
import EFS from 'aws-react-icons/icons/ArchitectureServiceAmazonEFS'
import Glacier from 'aws-react-icons/icons/ArchitectureServiceAmazonSimpleStorageServiceGlacier'
import Aurora from 'aws-react-icons/icons/ArchitectureServiceAmazonAurora'
import DocumentDB from 'aws-react-icons/icons/ArchitectureServiceAmazonDocumentDB'
import Neptune from 'aws-react-icons/icons/ArchitectureServiceAmazonNeptune'
import Keyspaces from 'aws-react-icons/icons/ArchitectureServiceAmazonKeyspaces'
import ElastiCache from 'aws-react-icons/icons/ArchitectureServiceAmazonElastiCache'
import DAX from 'aws-react-icons/icons/ResourceAmazonDynamoDBAmazonDynamoDBAccelerator'
import Route53 from 'aws-react-icons/icons/ArchitectureServiceAmazonRoute53'
import ApiGateway from 'aws-react-icons/icons/ArchitectureServiceAmazonAPIGateway'
import Connect from 'aws-react-icons/icons/ArchitectureServiceAmazonConnect'
import Chime from 'aws-react-icons/icons/ArchitectureServiceAmazonChime'
import WorkMail from 'aws-react-icons/icons/ArchitectureServiceAmazonWorkMail'
import QuickSight from 'aws-react-icons/icons/ArchitectureServiceAmazonQuickSuite'
import AwsCloud from 'aws-react-icons/icons/ArchitectureGroupAWSCloudlogoDark'
import ELB from 'aws-react-icons/icons/ArchitectureServiceElasticLoadBalancing'
import SQS from 'aws-react-icons/icons/ArchitectureServiceAmazonSimpleQueueService'
import SNS from 'aws-react-icons/icons/ArchitectureServiceAmazonSimpleNotificationService'
import EventBridge from 'aws-react-icons/icons/ArchitectureServiceAmazonEventBridge'
import StepFunctions from 'aws-react-icons/icons/ArchitectureServiceAWSStepFunctions'
import Redshift from 'aws-react-icons/icons/ArchitectureServiceAmazonRedshift'
import Athena from 'aws-react-icons/icons/ArchitectureServiceAmazonAthena'
import Glue from 'aws-react-icons/icons/ArchitectureServiceAWSGlue'
import EMR from 'aws-react-icons/icons/ArchitectureServiceAmazonEMR'
import LakeFormation from 'aws-react-icons/icons/ArchitectureServiceAWSLakeFormation'
import Kinesis from 'aws-react-icons/icons/ArchitectureServiceAmazonKinesisDataStreams'
import Firehose from 'aws-react-icons/icons/ArchitectureServiceAmazonDataFirehose'
import DMS from 'aws-react-icons/icons/ArchitectureServiceAWSDatabaseMigrationService'
import DataSync from 'aws-react-icons/icons/ArchitectureServiceAWSDataSync'
import Snowball from 'aws-react-icons/icons/ArchitectureServiceAWSSnowball'
import StorageGateway from 'aws-react-icons/icons/ArchitectureServiceAWSStorageGateway'
import KMS from 'aws-react-icons/icons/ArchitectureServiceAWSKeyManagementService'
import WAF from 'aws-react-icons/icons/ArchitectureServiceAWSWAF'
import GuardDuty from 'aws-react-icons/icons/ArchitectureServiceAmazonGuardDuty'
import ACM from 'aws-react-icons/icons/ArchitectureServiceAWSCertificateManager'
import SecretsManager from 'aws-react-icons/icons/ArchitectureServiceAWSSecretsManager'
import Shield from 'aws-react-icons/icons/ArchitectureServiceAWSShield'
import FirewallManager from 'aws-react-icons/icons/ArchitectureServiceAWSFirewallManager'
import Inspector from 'aws-react-icons/icons/ArchitectureServiceAmazonInspector'
import Macie from 'aws-react-icons/icons/ArchitectureServiceAmazonMacie'
import SecurityHub from 'aws-react-icons/icons/ArchitectureServiceAWSSecurityHub'
import Detective from 'aws-react-icons/icons/ArchitectureServiceAmazonDetective'
import Cognito from 'aws-react-icons/icons/ArchitectureServiceAmazonCognito'
import CloudWatch from 'aws-react-icons/icons/ArchitectureServiceAmazonCloudWatch'
import CloudFormation from 'aws-react-icons/icons/ArchitectureServiceAWSCloudFormation'
import CostExplorer from 'aws-react-icons/icons/ArchitectureServiceAWSCostExplorer'
import Backup from 'aws-react-icons/icons/ArchitectureServiceAWSBackup'
import CloudTrail from 'aws-react-icons/icons/ArchitectureServiceAWSCloudTrail'
import Config from 'aws-react-icons/icons/ArchitectureServiceAWSConfig'
import CodePipeline from 'aws-react-icons/icons/ArchitectureServiceAWSCodePipeline'
import CodeBuild from 'aws-react-icons/icons/ArchitectureServiceAWSCodeBuild'
import CodeDeploy from 'aws-react-icons/icons/ArchitectureServiceAWSCodeDeploy'
import CodeCommit from 'aws-react-icons/icons/ArchitectureServiceAWSCodeCommit'
import Budgets from 'aws-react-icons/icons/ArchitectureServiceAWSBudgets'
import TrustedAdvisor from 'aws-react-icons/icons/ArchitectureServiceAWSTrustedAdvisor'
import Organizations from 'aws-react-icons/icons/ArchitectureServiceAWSOrganizations'

export type AwsIcon = ComponentType<{ size?: number | string }>

export const AWS_ICONS: Record<string, AwsIcon> = {
  ec2: EC2,
  lambda: Lambda,
  s3: S3,
  ebs: EBS,
  rds: RDS,
  dynamodb: DynamoDB,
  vpc: VPC,
  cloudfront: CloudFront,
  iam: IAM,
  beanstalk: Beanstalk,
  ecs: ECS,
  fargate: Fargate,
  efs: EFS,
  glacier: Glacier,
  aurora: Aurora,
  documentdb: DocumentDB,
  neptune: Neptune,
  keyspaces: Keyspaces,
  elasticache: ElastiCache,
  dax: DAX,
  route53: Route53,
  apigateway: ApiGateway,
  connect: Connect,
  chime: Chime,
  workmail: WorkMail,
  quicksight: QuickSight,
  awscloud: AwsCloud,
  elb: ELB,
  sqs: SQS,
  sns: SNS,
  eventbridge: EventBridge,
  stepfunctions: StepFunctions,
  redshift: Redshift,
  athena: Athena,
  glue: Glue,
  emr: EMR,
  lakeformation: LakeFormation,
  kinesis: Kinesis,
  firehose: Firehose,
  dms: DMS,
  datasync: DataSync,
  snowball: Snowball,
  storagegateway: StorageGateway,
  kms: KMS,
  waf: WAF,
  guardduty: GuardDuty,
  acm: ACM,
  secretsmanager: SecretsManager,
  shield: Shield,
  firewallmanager: FirewallManager,
  inspector: Inspector,
  macie: Macie,
  securityhub: SecurityHub,
  detective: Detective,
  cognito: Cognito,
  cloudwatch: CloudWatch,
  cloudformation: CloudFormation,
  costexplorer: CostExplorer,
  backup: Backup,
  cloudtrail: CloudTrail,
  config: Config,
  codepipeline: CodePipeline,
  codebuild: CodeBuild,
  codedeploy: CodeDeploy,
  codecommit: CodeCommit,
  budgets: Budgets,
  trustedadvisor: TrustedAdvisor,
  organizations: Organizations,
}
