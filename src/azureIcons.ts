// Registry of official Microsoft Azure service icons (from `@threeveloper/azure-react-icons`, a
// component build of the Azure Architecture Icon set). A SceneNode references one by key via
// `icon: 'vm'`; SceneNode/ContainerNode render it in place of the pattern's default lucide glyph.
//
// The package's own names are long and carry a category suffix where two categories ship the same
// tile (`AppServicesCompute` vs `AppServicesWeb`). The keys here are the short spoken name of the
// service instead — what an author would type — and they are what a content repo sees.
//
// Two gaps in the upstream set, both deliberate fallbacks rather than a wrong tile:
//   * no standalone **Microsoft Entra ID** tile — `tenant` (Tenant Properties) is the directory node;
//   * no **Microsoft Fabric** tile — use `synapse` or the lucide chain until the set catches up.
//
// Every key below is drawn on Microsoft's 18x18 art board, which is what lets NodeIcon scale them all
// with one `viewBox="0 0 18 18"` — the upstream components carry no viewBox of their own. Four icons
// in the package use a different board (AppSpace 36, AzureNetworkFunctionManager 16, and two Defender
// device tiles at 19); adding one of those here would render cropped or padded. Check before adding.
//
// Four services exist in BOTH clouds' sets, and AWS_ICONS is checked first — so the Azure keys are
// spelled apart on purpose: `backupcenter`, `costbudgets`, `dbmigration`, `wafpolicy`. Never add a
// key here that awsIcons.ts already has; the chain would resolve it to the AWS tile in silence.

import type { ComponentType } from 'react'

// Scope & the portal
import {
  ManagementGroups,
  Subscriptions,
  ResourceGroups,
  AllResources,
  Tags,
  Templates,
  Marketplace,
  Dashboard,
  AzureCloudShell,
  Powershell,
  RegionManagement,
  Reservations,
  AzureQuotas,
  ServiceHealth,
  AzureArc,
  AzureLighthouse,
  ResourceGraphExplorer,
  AzureDevOps,
} from '@threeveloper/azure-react-icons'

// Identity
import {
  TenantProperties,
  Users,
  Groups,
  EnterpriseApplications,
  AppRegistrationsIdentity,
  ManagedIdentities,
  EntraIdentityRolesAndAdministratorsIdentity,
  EntraIdentityCustomRoles,
  ConditionalAccess,
  MultiFactorAuthentication,
  EntraPrivlegedIdentityManagement,
  IdentityGovernance,
  EntraDomainServices,
  AzureADB2C,
  ExternalIdentities,
  AdministrativeUnits,
  EntraIDProtection,
} from '@threeveloper/azure-react-icons'

// Compute
import {
  VirtualMachine,
  VMScaleSets,
  AvailabilitySets,
  Disks,
  DisksSnapshots,
  AzureComputeGalleriesCompute,
  AppServicesCompute,
  AppServicePlansWeb,
  FunctionAppsCompute,
  KubernetesServicesCompute,
  ContainerInstancesCompute,
  ContainerRegistries,
  ContainerAppsEnvironments,
  AzureSpringAppsWeb,
} from '@threeveloper/azure-react-icons'

// Storage
import {
  StorageAccounts,
  StorageContainer,
  BlobBlock,
  AzureFileshares,
  StorageQueue,
  Table,
  DataLakeStorageGen1,
  AzureNetAppFiles,
  DataBoxStorage,
  StorageExplorer,
  AzureStorageMover,
} from '@threeveloper/azure-react-icons'

// Networking
import {
  VirtualNetworks,
  Subnet,
  NetworkInterfaces,
  NetworkSecurityGroups,
  ApplicationSecurityGroups,
  RouteTables,
  Firewalls,
  NAT,
  VirtualNetworkGateways,
  ExpressRouteCircuits,
  VirtualWANs,
  Connections,
  LoadBalancers,
  ApplicationGateways,
  FrontDoorAndCDNProfilesNetworking,
  CDNProfilesNetworking,
  TrafficManagerProfiles,
  DNSZones,
  DNSPrivateResolver,
  PrivateLink,
  PrivateEndpoints,
  PublicIPAddresses,
  Bastions,
  NetworkWatcherNetworking,
} from '@threeveloper/azure-react-icons'

// Databases
import {
  AzureSQL,
  SQLDatabase,
  SQLManagedInstance,
  AzureSQLVM,
  SQLServer,
  SQLElasticPools,
  AzureCosmosDBDatabases,
  AzureDatabasePostgreSQLServer,
  AzureDatabaseMySQLServer,
  CacheRedis,
  AzureDatabaseMigrationServicesDatabases,
} from '@threeveloper/azure-react-icons'

// Data & analytics
import {
  AzureSynapseAnalyticsAnalytics,
  DataFactoriesAnalytics,
  AzureDatabricks,
  AzurePurviewAccounts,
  AzureDataExplorerClustersAnalytics,
  EventHubsAnalytics,
  StreamAnalyticsJobsAnalytics,
  PowerBIEmbedded,
} from '@threeveloper/azure-react-icons'

// Integration & serverless
import {
  AzureServiceBus,
  EventGridTopics,
  EventGridSubscriptionsIntegration,
  LogicAppsIntegration,
  APIManagementServicesIntegration,
} from '@threeveloper/azure-react-icons'

// Security
import {
  KeyVaults,
  MicrosoftDefenderForCloud,
  AzureSentinel,
  AzureInformationProtectionSecurity,
  DiskEncryptionSets,
  DDoSProtectionPlans,
  WebApplicationFirewallPoliciesWAF,
} from '@threeveloper/azure-react-icons'

// Monitoring, governance & cost
import {
  MonitorMonitor,
  Alerts,
  Workbooks,
  ApplicationInsightsMonitor,
  MetricsMonitor,
  ActivityLogMonitor,
  LogAnalyticsWorkspacesManagementGovernance,
  DiagnosticsSettingsMonitor,
  AzureManagedGrafana,
  Policy,
  Blueprints,
  Advisor,
  Compliance,
  CostManagement,
  CostAnalysis,
  CostBudgets,
  RecoveryServicesVaultsManagementGovernance,
  AzureBackupCenter,
  AutomationAccounts,
} from '@threeveloper/azure-react-icons'

export const AZURE_ICONS: Record<string, ComponentType<{ size?: string; viewBox?: string }>> = {
  // Scope & the portal
  managementgroup: ManagementGroups,
  subscription: Subscriptions,
  resourcegroup: ResourceGroups,
  allresources: AllResources,
  tags: Tags,
  template: Templates,
  marketplace: Marketplace,
  dashboard: Dashboard,
  cloudshell: AzureCloudShell,
  powershell: Powershell,
  region: RegionManagement,
  reservations: Reservations,
  quotas: AzureQuotas,
  servicehealth: ServiceHealth,
  arc: AzureArc,
  lighthouse: AzureLighthouse,
  resourcegraph: ResourceGraphExplorer,
  devops: AzureDevOps,
  // Identity
  tenant: TenantProperties,
  users: Users,
  groups: Groups,
  enterpriseapps: EnterpriseApplications,
  appregistration: AppRegistrationsIdentity,
  managedidentity: ManagedIdentities,
  roles: EntraIdentityRolesAndAdministratorsIdentity,
  customroles: EntraIdentityCustomRoles,
  conditionalaccess: ConditionalAccess,
  mfa: MultiFactorAuthentication,
  pim: EntraPrivlegedIdentityManagement,
  identitygovernance: IdentityGovernance,
  domainservices: EntraDomainServices,
  b2c: AzureADB2C,
  externalidentities: ExternalIdentities,
  adminunits: AdministrativeUnits,
  idprotection: EntraIDProtection,
  // Compute
  vm: VirtualMachine,
  vmss: VMScaleSets,
  availabilityset: AvailabilitySets,
  disk: Disks,
  snapshot: DisksSnapshots,
  gallery: AzureComputeGalleriesCompute,
  appservice: AppServicesCompute,
  appserviceplan: AppServicePlansWeb,
  functions: FunctionAppsCompute,
  aks: KubernetesServicesCompute,
  aci: ContainerInstancesCompute,
  acr: ContainerRegistries,
  containerapps: ContainerAppsEnvironments,
  springapps: AzureSpringAppsWeb,
  // Storage
  storage: StorageAccounts,
  blob: StorageContainer,
  blobblock: BlobBlock,
  files: AzureFileshares,
  queue: StorageQueue,
  storagetable: Table,
  adls: DataLakeStorageGen1,
  netapp: AzureNetAppFiles,
  databox: DataBoxStorage,
  storageexplorer: StorageExplorer,
  storagemover: AzureStorageMover,
  // Networking
  vnet: VirtualNetworks,
  subnet: Subnet,
  nic: NetworkInterfaces,
  nsg: NetworkSecurityGroups,
  asg: ApplicationSecurityGroups,
  routetable: RouteTables,
  firewall: Firewalls,
  natgateway: NAT,
  vnetgateway: VirtualNetworkGateways,
  expressroute: ExpressRouteCircuits,
  vwan: VirtualWANs,
  connection: Connections,
  loadbalancer: LoadBalancers,
  appgateway: ApplicationGateways,
  frontdoor: FrontDoorAndCDNProfilesNetworking,
  cdn: CDNProfilesNetworking,
  trafficmanager: TrafficManagerProfiles,
  dns: DNSZones,
  dnsresolver: DNSPrivateResolver,
  privatelink: PrivateLink,
  privateendpoint: PrivateEndpoints,
  publicip: PublicIPAddresses,
  bastion: Bastions,
  networkwatcher: NetworkWatcherNetworking,
  // Databases
  azuresql: AzureSQL,
  sqldatabase: SQLDatabase,
  sqlmi: SQLManagedInstance,
  sqlvm: AzureSQLVM,
  sqlserver: SQLServer,
  elasticpool: SQLElasticPools,
  cosmos: AzureCosmosDBDatabases,
  postgres: AzureDatabasePostgreSQLServer,
  mysql: AzureDatabaseMySQLServer,
  redis: CacheRedis,
  dbmigration: AzureDatabaseMigrationServicesDatabases,
  // Data & analytics
  synapse: AzureSynapseAnalyticsAnalytics,
  datafactory: DataFactoriesAnalytics,
  databricks: AzureDatabricks,
  purview: AzurePurviewAccounts,
  dataexplorer: AzureDataExplorerClustersAnalytics,
  eventhubs: EventHubsAnalytics,
  streamanalytics: StreamAnalyticsJobsAnalytics,
  powerbi: PowerBIEmbedded,
  // Integration & serverless
  servicebus: AzureServiceBus,
  eventgrid: EventGridTopics,
  eventgridsub: EventGridSubscriptionsIntegration,
  logicapps: LogicAppsIntegration,
  apim: APIManagementServicesIntegration,
  // Security
  keyvault: KeyVaults,
  defender: MicrosoftDefenderForCloud,
  sentinel: AzureSentinel,
  infoprotection: AzureInformationProtectionSecurity,
  diskencryption: DiskEncryptionSets,
  ddos: DDoSProtectionPlans,
  wafpolicy: WebApplicationFirewallPoliciesWAF,
  // Monitoring, governance & cost
  monitor: MonitorMonitor,
  alerts: Alerts,
  workbooks: Workbooks,
  appinsights: ApplicationInsightsMonitor,
  metrics: MetricsMonitor,
  activitylog: ActivityLogMonitor,
  loganalytics: LogAnalyticsWorkspacesManagementGovernance,
  diagnostics: DiagnosticsSettingsMonitor,
  grafana: AzureManagedGrafana,
  policy: Policy,
  blueprints: Blueprints,
  advisor: Advisor,
  compliance: Compliance,
  cost: CostManagement,
  costanalysis: CostAnalysis,
  costbudgets: CostBudgets,
  recoveryvault: RecoveryServicesVaultsManagementGovernance,
  backupcenter: AzureBackupCenter,
  automation: AutomationAccounts,
}
