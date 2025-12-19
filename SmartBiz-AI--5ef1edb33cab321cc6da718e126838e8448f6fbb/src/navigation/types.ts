export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
  Agents: undefined;
  Content: undefined;
  Profile: undefined;
  Home: undefined;
  SetupBusiness: undefined;
  SelectAgent: { businessId: string };
  CreateAgent: undefined;

  AgentWorkspace: { agentId?: string };
  ContentGenerator: undefined;
  ContentFeed: undefined;
  Settings: undefined;
  AIInsights: undefined;
};
