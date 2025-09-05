import { Navigate, Route } from "react-router-dom";
import { all_routes } from "./all_routes";
import React from "react";

// Lazy load all heavy components
const Countries = React.lazy(() => import("../content/location/countries"));
const DataTable = React.lazy(() => import("../tables/dataTable"));
const BasicTable = React.lazy(() => import("../tables/basicTable"));
const DeleteRequest = React.lazy(() => import("../userManagement/deleteRequest"));
const Membershipplan = React.lazy(() => import("../membership/membershipplan"));
const MembershipAddon = React.lazy(() => import("../membership/membershipaddon"));
const Notes = React.lazy(() => import("../application/notes"));
const ComingSoon = React.lazy(() => import("../pages/comingSoon"));
const Login = React.lazy(() => import("../auth/login/login"));
const Register = React.lazy(() => import("../auth/register/register"));
const TwoStepVerification = React.lazy(() => import("../auth/twoStepVerification/twoStepVerification"));
const EmailVerification = React.lazy(() => import("../auth/emailVerification/emailVerification"));
const ResetPassword = React.lazy(() => import("../auth/resetPassword/resetPassword"));
const ForgotPassword = React.lazy(() => import("../auth/forgotPassword/forgotPassword"));
const Accordion = React.lazy(() => import("../uiInterface/base-ui/accordion"));
const Avatar = React.lazy(() => import("../uiInterface/base-ui/avatar"));
const Borders = React.lazy(() => import("../uiInterface/base-ui/borders"));
const Breadcrumb = React.lazy(() => import("../uiInterface/base-ui/breadcrumb"));
const Buttons = React.lazy(() => import("../uiInterface/base-ui/buttons"));
const ButtonsGroup = React.lazy(() => import("../uiInterface/base-ui/buttonsgroup"));
const Cards = React.lazy(() => import("../uiInterface/base-ui/cards"));
const Carousel = React.lazy(() => import("../uiInterface/base-ui/carousel"));
const Colors = React.lazy(() => import("../uiInterface/base-ui/colors"));
const Dropdowns = React.lazy(() => import("../uiInterface/base-ui/dropdowns"));
const Grid = React.lazy(() => import("../uiInterface/base-ui/grid"));
const Images = React.lazy(() => import("../uiInterface/base-ui/images"));
const Lightboxes = React.lazy(() => import("../uiInterface/base-ui/lightbox"));
const Media = React.lazy(() => import("../uiInterface/base-ui/media"));
const Modals = React.lazy(() => import("../uiInterface/base-ui/modals"));
const NavTabs = React.lazy(() => import("../uiInterface/base-ui/navtabs"));
const Offcanvas = React.lazy(() => import("../uiInterface/base-ui/offcanvas"));
const Pagination = React.lazy(() => import("../uiInterface/base-ui/pagination"));
const Popovers = React.lazy(() => import("../uiInterface/base-ui/popover"));
const RangeSlides = React.lazy(() => import("../uiInterface/base-ui/rangeslider"));
const Progress = React.lazy(() => import("../uiInterface/base-ui/progress"));
const Spinner = React.lazy(() => import("../uiInterface/base-ui/spinner"));
const Toasts = React.lazy(() => import("../uiInterface/base-ui/toasts"));
const Typography = React.lazy(() => import("../uiInterface/base-ui/typography"));
const Video = React.lazy(() => import("../uiInterface/base-ui/video"));
const Error404 = React.lazy(() => import("../pages/error/error-404"));
const Error500 = React.lazy(() => import("../pages/error/error-500"));
const UnderMaintenance = React.lazy(() => import("../pages/underMaintenance"));
const Email = React.lazy(() => import("../application/email"));
const Chat = React.lazy(() => import("../application/chat"));
const CallHistory = React.lazy(() => import("../application/call/callHistory"));
const FileManager = React.lazy(() => import("../application/fileManager"));
const MembershipTransaction = React.lazy(() => import("../membership/membershiptrasaction"));
const ClipBoard = React.lazy(() => import("../uiInterface/advanced-ui/clipboard"));
const Counter = React.lazy(() => import("../uiInterface/advanced-ui/counter"));
const DragAndDrop = React.lazy(() => import("../uiInterface/advanced-ui/dragdrop"));
const Rating = React.lazy(() => import("../uiInterface/advanced-ui/rating"));
const Stickynote = React.lazy(() => import("../uiInterface/advanced-ui/stickynote"));
const TextEditor = React.lazy(() => import("../uiInterface/advanced-ui/texteditor"));
const Timeline = React.lazy(() => import("../uiInterface/advanced-ui/timeline"));
const Scrollbar = React.lazy(() => import("../uiInterface/advanced-ui/uiscrollbar"));
const Apexchart = React.lazy(() => import("../uiInterface/charts/apexcharts"));
const FeatherIcons = React.lazy(() => import("../uiInterface/icons/feathericon"));
const FontawesomeIcons = React.lazy(() => import("../uiInterface/icons/fontawesome"));
const MaterialIcons = React.lazy(() => import("../uiInterface/icons/materialicon"));
const PE7Icons = React.lazy(() => import("../uiInterface/icons/pe7icons"));
const SimplelineIcons = React.lazy(() => import("../uiInterface/icons/simplelineicon"));
const ThemifyIcons = React.lazy(() => import("../uiInterface/icons/themify"));
const TypiconIcons = React.lazy(() => import("../uiInterface/icons/typicons"));
const WeatherIcons = React.lazy(() => import("../uiInterface/icons/weathericons"));
const BasicInputs = React.lazy(() => import("../uiInterface/forms/formelements/basic-inputs"));
const CheckboxRadios = React.lazy(() => import("../uiInterface/forms/formelements/checkbox-radios"));
const InputGroup = React.lazy(() => import("../uiInterface/forms/formelements/input-group"));
const GridGutters = React.lazy(() => import("../uiInterface/forms/formelements/grid-gutters"));
const FormSelect = React.lazy(() => import("../uiInterface/forms/formelements/form-select"));
const FormMask = React.lazy(() => import("../uiInterface/forms/formelements/form-mask"));
const FileUpload = React.lazy(() => import("../uiInterface/forms/formelements/fileupload"));
const FormHorizontal = React.lazy(() => import("../uiInterface/forms/formelements/layouts/form-horizontal"));
const FormVertical = React.lazy(() => import("../uiInterface/forms/formelements/layouts/form-vertical"));
const FloatingLabel = React.lazy(() => import("../uiInterface/forms/formelements/layouts/floating-label"));
const FormValidation = React.lazy(() => import("../uiInterface/forms/formelements/layouts/form-validation"));
const FormSelect2 = React.lazy(() => import("../uiInterface/forms/formelements/layouts/form-select2"));
const FormWizard = React.lazy(() => import("../uiInterface/forms/formelements/form-wizard"));
const DataTables = React.lazy(() => import("../uiInterface/table/data-tables"));
const TablesBasic = React.lazy(() => import("../uiInterface/table/tables-basic"));
const IonicIcons = React.lazy(() => import("../uiInterface/icons/ionicicons"));
const Badges = React.lazy(() => import("../uiInterface/base-ui/badges"));
const Placeholder = React.lazy(() => import("../uiInterface/base-ui/placeholder"));
const Alert = React.lazy(() => import("../uiInterface/base-ui/alert"));
const Tooltips = React.lazy(() => import("../uiInterface/base-ui/tooltips"));
const Ribbon = React.lazy(() => import("../uiInterface/advanced-ui/ribbon"));
const AdminDashboard = React.lazy(() => import("../mainMenu/adminDashboard"));
const AlertUi = React.lazy(() => import("../uiInterface/base-ui/alert-ui"));

const Login2 = React.lazy(() => import("../auth/login/login-2"));
const Login3 = React.lazy(() => import("../auth/login/login-3"));
const ResetPassword2 = React.lazy(() => import("../auth/resetPassword/resetPassword-2"));
const ResetPassword3 = React.lazy(() => import("../auth/resetPassword/resetPassword-3"));
const TwoStepVerification2 = React.lazy(() => import("../auth/twoStepVerification/twoStepVerification-2"));
const TwoStepVerification3 = React.lazy(() => import("../auth/twoStepVerification/twoStepVerification-3"));
const Register2 = React.lazy(() => import("../auth/register/register-2"));
const Register3 = React.lazy(() => import("../auth/register/register-3"));
const ForgotPassword2 = React.lazy(() => import("../auth/forgotPassword/forgotPassword-2"));
const ForgotPassword3 = React.lazy(() => import("../auth/forgotPassword/forgotPassword-3"));
const ResetPasswordSuccess = React.lazy(() => import("../auth/resetPasswordSuccess/resetPasswordSuccess"));
const ResetPasswordSuccess2 = React.lazy(() => import("../auth/resetPasswordSuccess/resetPasswordSuccess-2"));
const ResetPasswordSuccess3 = React.lazy(() => import("../auth/resetPasswordSuccess/resetPasswordSuccess-3"));

const RolesPermissions = React.lazy(() => import("../userManagement/rolesPermissions"));
const Permission = React.lazy(() => import("../userManagement/permission"));
const Manageusers = React.lazy(() => import("../userManagement/manageusers"));
const Profilesettings = React.lazy(() => import("../settings/generalSettings/profile-settings"));
const Securitysettings = React.lazy(() => import("../settings/generalSettings/security-settings"));
const Notificationssettings = React.lazy(() => import("../settings/generalSettings/notifications-settings"));
const ConnectedApps = React.lazy(() => import("../settings/generalSettings/connected-apps"));
const Bussinesssettings = React.lazy(() => import("../settings/websiteSettings/bussiness-settings"));
const Seosettings = React.lazy(() => import("../settings/websiteSettings/seo-settings"));
const CompanySettings = React.lazy(() => import("../settings/websiteSettings/companySettings"));
const Localizationsettings = React.lazy(() => import("../settings/websiteSettings/localization-settings"));
const Prefixes = React.lazy(() => import("../settings/websiteSettings/prefixes"));
const Preference = React.lazy(() => import("../settings/websiteSettings/preferences"));
const Authenticationsettings = React.lazy(() => import("../settings/websiteSettings/authentication-settings"));
const Languagesettings = React.lazy(() => import("../settings/websiteSettings/language"));
const InvoiceSettings = React.lazy(() => import("../settings/appSettings/invoiceSettings"));
const CustomFields = React.lazy(() => import("../settings/appSettings/customFields"));
const EmailSettings = React.lazy(() => import("../settings/systemSettings/emailSettings"));
const Emailtemplates = React.lazy(() => import("../settings/systemSettings/email-templates"));
const SmsSettings = React.lazy(() => import("../settings/systemSettings/smsSettings"));
const OtpSettings = React.lazy(() => import("../settings/systemSettings/otp-settings"));
const GdprCookies = React.lazy(() => import("../settings/systemSettings/gdprCookies"));
const PaymentGateways = React.lazy(() => import("../settings/financialSettings/paymentGateways"));
const TaxRates = React.lazy(() => import("../settings/financialSettings/taxRates"));
const Storage = React.lazy(() => import("../settings/otherSettings/storage"));
const BanIpAddress = React.lazy(() => import("../settings/otherSettings/banIpaddress"));
const BlogCategories = React.lazy(() => import("../content/blog/blogCategories"));
const BlogComments = React.lazy(() => import("../content/blog/blogComments"));
const BlogTags = React.lazy(() => import("../content/blog/blogTags"));
const Faq = React.lazy(() => import("../content/faq"));
const Cities = React.lazy(() => import("../content/location/cities"));
const States = React.lazy(() => import("../content/location/states"));
const Testimonials = React.lazy(() => import("../content/testimonials"));
const Profile = React.lazy(() => import("../pages/profile"));
const LockScreen = React.lazy(() => import("../auth/lockScreen"));
const EmailVerification2 = React.lazy(() => import("../auth/emailVerification/emailVerification-2"));
const EmailVerification3 = React.lazy(() => import("../auth/emailVerification/emailVerification-3"));
const EmployeeDashboard = React.lazy(() => import("../mainMenu/employeeDashboard/employee-dashboard"));
const LeadsDasboard = React.lazy(() => import("../mainMenu/leadsDashboard"));
const DealsDashboard = React.lazy(() => import("../mainMenu/dealsDashboard"));
const Leaflet = React.lazy(() => import("../uiInterface/map/leaflet"));
const BootstrapIcons = React.lazy(() => import("../uiInterface/icons/bootstrapicons"));
const RemixIcons = React.lazy(() => import("../uiInterface/icons/remixIcons"));
const FlagIcons = React.lazy(() => import("../uiInterface/icons/flagicons"));
const Swiperjs = React.lazy(() => import("../uiInterface/base-ui/swiperjs"));
const Sortable = React.lazy(() => import("../uiInterface/base-ui/ui-sortable"));
const PrimeReactChart = React.lazy(() => import("../uiInterface/charts/prime-react-chart"));
const ChartJSExample = React.lazy(() => import("../uiInterface/charts/chartjs"));
const FormPikers = React.lazy(() => import("../uiInterface/forms/formelements/formpickers"));
const VoiceCall = React.lazy(() => import("../application/call/voiceCall"));
const Videocallss = React.lazy(() => import("../application/call/videocalls"));
const OutgoingCalls = React.lazy(() => import("../application/call/outgingcalls"));
const IncomingCall = React.lazy(() => import("../application/call/incomingcall"));
const Calendars = React.lazy(() => import("../mainMenu/apps/calendar"));
const SocialFeed = React.lazy(() => import("../application/socialfeed"));
const KanbanView = React.lazy(() => import("../application/kanbanView"));
const Todo = React.lazy(() => import("../application/todo/todo"));
const TodoList = React.lazy(() => import("../application/todo/todolist"));
const StarterPage = React.lazy(() => import("../pages/starter"));
const SearchResult = React.lazy(() => import("../pages/search-result"));
const TimeLines = React.lazy(() => import("../pages/timeline"));
const Pricing = React.lazy(() => import("../pages/pricing"));
const ApiKeys = React.lazy(() => import("../pages/api-keys"));
const UnderConstruction = React.lazy(() => import("../pages/underConstruction"));
const PrivacyPolicy = React.lazy(() => import("../pages/privacy-policy"));
const TermsCondition = React.lazy(() => import("../pages/terms-condition"));
const Gallery = React.lazy(() => import("../pages/gallery"));
const EmailReply = React.lazy(() => import("../application/emailReply"));
const Blogs = React.lazy(() => import("../content/blog/blogs"));
const Page = React.lazy(() => import("../content/page"));
const Assets = React.lazy(() => import("../administration/asset"));
const AssetsCategory = React.lazy(() => import("../administration/asset-category"));
const Knowledgebase = React.lazy(() => import("../administration/help-support/knowledgebase"));
const Activity = React.lazy(() => import("../administration/help-support/activity"));
const Activities = React.lazy(() => import("../administration/help-support/activities"));
const Users = React.lazy(() => import("../administration/user-management/users"));
const RolesPermission = React.lazy(() => import("../administration/user-management/rolePermission"));
const Categories = React.lazy(() => import("../accounting/categories"));
const Budgets = React.lazy(() => import("../accounting/budgets"));
const BudgetExpenses = React.lazy(() => import("../accounting/budget-expenses"));
const BudgetRevenues = React.lazy(() => import("../accounting/budget-revenues"));
const Appearance = React.lazy(() => import("../settings/websiteSettings/appearance"));
const SuperAdminDashboard = React.lazy(() => import("../super-admin/dashboard"));
// import LayoutDemo from "../mainMenu/layout-dashoard";
const ExpensesReport = React.lazy(() => import("../administration/reports/expensereport"));
const InvoiceReport = React.lazy(() => import("../administration/reports/invoicereport"));
const PaymentReport = React.lazy(() => import("../administration/reports/paymentreport"));
const ProjectReport = React.lazy(() => import("../administration/reports/projectreport"));
const InvoiceDetails = React.lazy(() => import("../sales/invoiceDetails"));
const TaskReport = React.lazy(() => import("../administration/reports/taskreport"));
const UserReports = React.lazy(() => import("../administration/reports/userreports"));
const EmployeeReports = React.lazy(() => import("../administration/reports/employeereports"));
const EmployeeDetails = React.lazy(() => import("../hrm/employees/employeedetails"));
const PayslipReport = React.lazy(() => import("../administration/reports/payslipreport"));
const AttendanceReport = React.lazy(() => import("../administration/reports/attendencereport"));
const LeaveReport = React.lazy(() => import("../administration/reports/leavereport"));
const DailyReport = React.lazy(() => import("../administration/reports/dailyreport"));
const PermissionPage = React.lazy(() => import("../administration/user-management/permissionpage"));
const JobGrid = React.lazy(() => import("../recruitment/jobs/jobgrid"));
const JobList = React.lazy(() => import("../recruitment/joblist/joblist"));
const CandidateGrid = React.lazy(() => import("../recruitment/candidates/candidategrid"));
const CandidateKanban = React.lazy(() => import("../recruitment/candidates/candidatekanban"));
const CandidatesList = React.lazy(() => import("../recruitment/candidates/candidatelist"));
const RefferalList = React.lazy(() => import("../recruitment/refferal/refferallist"));
const ClienttGrid = React.lazy(() => import("../projects/clinet/clienttgrid"));
const ClientList = React.lazy(() => import("../projects/clinet/clientlist"));
const ClientDetails = React.lazy(() => import("../projects/clinet/clientdetails"));
const Project = React.lazy(() => import("../projects/project/project"));
const ProjectDetails = React.lazy(() => import("../projects/project/projectdetails"));
const ProjectList = React.lazy(() => import("../projects/project/projectlist"));
const Task = React.lazy(() => import("../projects/task/task"));
const TaskDetails = React.lazy(() => import("../projects/task/taskdetails"));
const TaskBoard = React.lazy(() => import("../projects/task/task-board"));
const Extimates = React.lazy(() => import("../finance-accounts/sales/estimates"));
const AddInvoice = React.lazy(() => import("../finance-accounts/sales/add_invoices"));
const EditInvoice = React.lazy(() => import("../finance-accounts/payrool/payslip"));
const Payments = React.lazy(() => import("../finance-accounts/sales/payment"));
const Expenses = React.lazy(() => import("../finance-accounts/sales/expenses"));
const ProvidentFund = React.lazy(() => import("../finance-accounts/sales/provident_fund"));
const Taxes = React.lazy(() => import("../finance-accounts/sales/taxes"));
const EmployeeSalary = React.lazy(() => import("../finance-accounts/payrool/employee_salary"));
const PaySlip = React.lazy(() => import("../finance-accounts/payrool/payslip"));
const PayRoll = React.lazy(() => import("../finance-accounts/payrool/payroll"));
const PayRollOvertime = React.lazy(() => import("../finance-accounts/payrool/payrollOvertime"));
const PayRollDeduction = React.lazy(() => import("../finance-accounts/payrool/payrollDedution"));
const Tickets = React.lazy(() => import("../tickets/tickets"));
const TicketGrid = React.lazy(() => import("../tickets/tickets-grid"));
const TicketDetails = React.lazy(() => import("../tickets/ticket-details"));
const PerformanceIndicator = React.lazy(() => import("../performance/performanceIndicator"));
const Aisettings = React.lazy(() => import("../settings/websiteSettings/ai-settings"));
const Salarysettings = React.lazy(() => import("../settings/appSettings/salary-settings"));
const Approvalsettings = React.lazy(() => import("../settings/appSettings/approval-settings"));
const LeaveType = React.lazy(() => import("../settings/appSettings/leave-type"));
const AttendanceSettings = React.lazy(() => import("../settings/appSettings/attendanceSettings"));
const SmsTemplate = React.lazy(() => import("../settings/systemSettings/sms-template"));
const Maintenancemode = React.lazy(() => import("../settings/systemSettings/maintenance-mode"));
const Currencies = React.lazy(() => import("../settings/financialSettings/currencies"));
const Customcss = React.lazy(() => import("../settings/otherSettings/custom-css"));
const Customjs = React.lazy(() => import("../settings/otherSettings/custom-js"));
const Cronjob = React.lazy(() => import("../settings/otherSettings/cronjob"));
const Cronjobschedule = React.lazy(() => import("../settings/otherSettings/cronjobSchedule"));
const Backup = React.lazy(() => import("../settings/otherSettings/backup"));
const Clearcache = React.lazy(() => import("../settings/otherSettings/clearCache"));
const Languageweb = React.lazy(() => import("../settings/websiteSettings/language-web"));
const Addlanguage = React.lazy(() => import("../settings/websiteSettings/add-language"));
const EmployeeList = React.lazy(() => import("../hrm/employees/employeesList"));
const EmployeeBirthdays = React.lazy(() => import("../hrm/employees/employeeBirthdays"));
const EmployeesGrid = React.lazy(() => import("../hrm/employees/employeesGrid"));
const Department = React.lazy(() => import("../hrm/employees/deparment"));
const Designations = React.lazy(() => import("../hrm/employees/designations"));
const Policy = React.lazy(() => import("../hrm/employees/policy"));
const CompaniesGrid = React.lazy(() => import("../crm/companies/companiesGrid"));
const ContactDetails = React.lazy(() => import("../crm/contacts/contactDetails"));
const ContactList = React.lazy(() => import("../crm/contacts/contactList"));
const ContactGrid = React.lazy(() => import("../crm/contacts/contactGrid"));
const CompaniesList = React.lazy(() => import("../crm/companies/companiesList"));
const CompaniesDetails = React.lazy(() => import("../crm/companies/companiesDetails"));
const LeadsGrid = React.lazy(() => import("../crm/leads/leadsGrid"));
const LeadsList = React.lazy(() => import("../crm/leads/leadsList"));
const LeadsDetails = React.lazy(() => import("../crm/leads/leadsDetails"));
const DealsGrid = React.lazy(() => import("../crm/deals/dealsGrid"));
const DealsList = React.lazy(() => import("../crm/deals/dealsList"));
const DealsDetails = React.lazy(() => import("../crm/deals/dealsDetails"));
const Pipeline = React.lazy(() => import("../crm/pipeline/pipeline"));
const Analytics = React.lazy(() => import("../crm/analytics/analytics"));
const Holidays = React.lazy(() => import("../hrm/holidays"));
const PerformanceReview = React.lazy(() => import("../performance/performanceReview"));
const PerformanceAppraisal = React.lazy(() => import("../performance/performanceAppraisal"));
const GoalTracking = React.lazy(() => import("../performance/goalTracking"));
const GoalType = React.lazy(() => import("../performance/goalType"));

const LeaveAdmin = React.lazy(() => import("../hrm/attendance/leaves/leaveAdmin"));
const LeaveEmployee = React.lazy(() => import("../hrm/attendance/leaves/leaveEmployee"));
const LeaveSettings = React.lazy(() => import("../hrm/attendance/leaves/leavesettings"));
const AttendanceAdmin = React.lazy(() => import("../hrm/attendance/attendanceadmin"));
const AttendanceEmployee = React.lazy(() => import("../hrm/attendance/attendance_employee"));
const TimeSheet = React.lazy(() => import("../hrm/attendance/timesheet"));
const ScheduleTiming = React.lazy(() => import("../hrm/attendance/scheduletiming"));
const OverTime = React.lazy(() => import("../hrm/attendance/overtime"));
const Companies = React.lazy(() => import("../super-admin/companies"));
const Subscription = React.lazy(() => import("../super-admin/subscription"));
const Packages = React.lazy(() => import("../super-admin/packages/packagelist"));
const PackageGrid = React.lazy(() => import("../super-admin/packages/packagelist"));
const TrainingType = React.lazy(() => import("../training/trainingType"));
const Domain = React.lazy(() => import("../super-admin/domin"));
const PurchaseTransaction = React.lazy(() => import("../super-admin/purchase-transaction"));
const Termination = React.lazy(() => import("../hrm/termination"));
const Resignation = React.lazy(() => import("../hrm/resignation"));
const Promotion = React.lazy(() => import("../hrm/promotion"));
const Trainers = React.lazy(() => import("../training/trainers"));
const TrainingList = React.lazy(() => import("../training/trainingList"));
const Invoices = React.lazy(() => import("../finance-accounts/sales/invoices"));
const routes = all_routes;

export const publicRoutes = [
  {
    path: "/",
    name: "Root",
    element: <Navigate to="/login" />,
    route: Route,
  },
  {
    path: routes.adminDashboard,
    element: <AdminDashboard />,
    route: Route,
  },
  {
    path: routes.employeeDashboard,
    element: <EmployeeDashboard />,
    route: Route,
  },
  {
    path: routes.leadsDashboard,
    element: <LeadsDasboard />,
    route: Route,
  },
  {
    path: routes.dealsDashboard,
    element: <DealsDashboard />,
    route: Route,
  },
  {
    path: routes.estimate,
    element: <Extimates />,
  },
  {
    path: routes.termination,
    element: <Termination />,
  },
  {
    path: routes.resignation,
    element: <Resignation />,
  },
  {
    path: routes.promotion,
    element: <Promotion />,
  },
  {
    path: routes.trainingType,
    element: <TrainingType />,
  },
  {
    path: routes.trainers,
    element: <Trainers />,
  },
  {
    path: routes.trainingList,
    element: <TrainingList />,
  },


  //Application
  {
    path: routes.chat,
    element: <Chat />,
    route: Route,
  },
  {
    path: routes.voiceCall,
    element: <VoiceCall />,
    route: Route,
  },

  {
    path: routes.videoCall,
    element: <Videocallss />,
    route: Route,
  },
  {
    path: routes.outgoingCall,
    element: <OutgoingCalls />,
    route: Route,
  },
  {
    path: routes.incomingCall,
    element: <IncomingCall />,
    route: Route,
  },
  {
    path: routes.callHistory,
    element: <CallHistory />,
    route: Route,
  },
  {
    path: routes.socialFeed,
    element: <SocialFeed />,
    route: Route,
  },
  {
    path: routes.kanbanView,
    element: <KanbanView />,
    route: Route,
  },
  {
    path: routes.countries,
    element: <Countries />,
    route: Route,
  },
  {
    path: routes.starter,
    element: <StarterPage />,
    route: Route,
  },
  {
    path: routes.calendar,
    element: <Calendars />,
    route: Route,
  },
  {
    path: routes.superAdminDashboard,
    element: <SuperAdminDashboard />,
    route: Route,
  },

  {
    path: routes.membershipplan,
    element: <Membershipplan />,
  },
  {
    path: routes.membershipAddon,
    element: <MembershipAddon />,
  },
  {
    path: routes.membershipTransaction,
    element: <MembershipTransaction />,
  },
  {
    path: routes.notes,
    element: <Notes />,
  },
  {
    path: routes.countries,
    element: <Countries />,
    route: Route,
  },
  {
    path: routes.customFields,
    element: <CustomFields />,
    route: Route,
  },
  {
    path: routes.dataTables,
    element: <DataTable />,
    route: Route,
  },
  {
    path: routes.tablesBasic,
    element: <BasicTable />,
    route: Route,
  },

  {
    path: routes.deleteRequest,
    element: <DeleteRequest />,
    route: Route,
  },
  {
    path: routes.cities,
    element: <Cities />,
    route: Route,
  },

  // --- UI Interface Route Entries ---
  // {
  //   path: routes.accordion,
  //   element: <Accordion />,
  //   route: Route,
  // },
  // {
  //   path: routes.avatar,
  //   element: <Avatar />,
  //   route: Route,
  // },
  // {
  //   path: routes.badges,
  //   element: <Badges />,
  //   route: Route,
  // },
  // {
  //   path: routes.border,
  //   element: <Borders />,
  //   route: Route,
  // },
  // {
  //   path: routes.breadcrums,
  //   element: <Breadcrumb />,
  //   route: Route,
  // },
  // {
  //   path: routes.button,
  //   element: <Buttons />,
  //   route: Route,
  // },
  // {
  //   path: routes.buttonGroup,
  //   element: <ButtonsGroup />,
  //   route: Route,
  // },
  // {
  //   path: routes.cards,
  //   element: <Cards />,
  //   route: Route,
  // },
  // {
  //   path: routes.carousel,
  //   element: <Carousel />,
  //   route: Route,
  // },
  // {
  //   path: routes.colors,
  //   element: <Colors />,
  //   route: Route,
  // },
  // {
  //   path: routes.dropdowns,
  //   element: <Dropdowns />,
  //   route: Route,
  // },
  // {
  //   path: routes.grid,
  //   element: <Grid />,
  //   route: Route,
  // },
  // {
  //   path: routes.images,
  //   element: <Images />,
  //   route: Route,
  // },
  // {
  //   path: routes.lightbox,
  //   element: <Lightboxes />,
  //   route: Route,
  // },
  // {
  //   path: routes.media,
  //   element: <Media />,
  //   route: Route,
  // },
  // {
  //   path: routes.modals,
  //   element: <Modals />,
  //   route: Route,
  // },
  // {
  //   path: routes.navTabs,
  //   element: <NavTabs />,
  //   route: Route,
  // },
  // {
  //   path: routes.offcanvas,
  //   element: <Offcanvas />,
  //   route: Route,
  // },
  // {
  //   path: routes.pagination,
  //   element: <Pagination />,
  //   route: Route,
  // },
  // {
  //   path: routes.popover,
  //   element: <Popovers />,
  //   route: Route,
  // },
  // {
  //   path: routes.rangeSlider,
  //   element: <RangeSlides />,
  //   route: Route,
  // },
  // {
  //   path: routes.progress,
  //   element: <Progress />,
  //   route: Route,
  // },
  // {
  //   path: routes.spinner,
  //   element: <Spinner />,
  //   route: Route,
  // },

  // {
  //   path: routes.typography,
  //   element: <Typography />,
  //   route: Route,
  // },
  // {
  //   path: routes.video,
  //   element: <Video />,
  //   route: Route,
  // },
  // {
  //   path: routes.sortable,
  //   element: <Sortable />,
  //   route: Route,
  // },
  // {
  //   path: routes.swiperjs,
  //   element: <Swiperjs />,
  //   route: Route,
  // },
  // {
  //   path: routes.bootstrapIcons,
  //   element: <BootstrapIcons />,
  //   route: Route,
  // },
  // {
  //   path: routes.toasts,
  //   element: <Toasts />,
  //   route: Route,
  // },
  // {
  //   path: routes.mapLeaflet,
  //   element: <Leaflet />,
  //   route: Route,
  // },
  // {
  //   path: routes.RemixIcons,
  //   element: <RemixIcons />,
  //   route: Route,
  // },
  // {
  //   path: routes.FlagIcons,
  //   element: <FlagIcons />,
  //   route: Route,
  // },
  // {
  //   path: routes.banIpAddress,
  //   element: <BanIpAddress />,
  //   route: Route,
  // },
  // {
  //   path: routes.todo,
  //   element: <Todo />,
  //   route: Route,
  // },
  // {
  //   path: routes.TodoList,
  //   element: <TodoList />,
  //   route: Route,
  // },
  // {
  //   path: routes.email,
  //   element: <Email />,
  //   route: Route,
  // },
  // {
  //   path: routes.EmailReply,
  //   element: <EmailReply />,
  //   route: Route,
  // },
  // {
  //   path: routes.chat,
  //   element: <Chat />,
  //   route: Route,
  // },
  // {
  //   path: routes.pages,
  //   element: <Page />,
  //   route: Route,
  // },

  {
    path: routes.fileManager,
    element: <FileManager />,
    route: Route,
  },
  // {
  //   path: routes.blogs,
  //   element: <Blogs />,
  //   route: Route,
  // },
  // {
  //   path: routes.blogCategories,
  //   element: <BlogCategories />,
  //   route: Route,
  // },
  // {
  //   path: routes.blogComments,
  //   element: <BlogComments />,
  //   route: Route,
  // },
  // {
  //   path: routes.blogTags,
  //   element: <BlogTags />,
  //   route: Route,
  // },
  // {
  //   path: routes.faq,
  //   element: <Faq />,
  //   route: Route,
  // },
  // {
  //   path: routes.testimonials,
  //   element: <Testimonials />,
  //   route: Route,
  // },
  {
    path: routes.states,
    element: <States />,
    route: Route,
  },
  {
    path: routes.clipboard,
    element: <ClipBoard />,
    route: Route,
  },
  {
    path: routes.counter,
    element: <Counter />,
    route: Route,
  },
  {
    path: routes.dragandDrop,
    element: <DragAndDrop />,
    route: Route,
  },
  {
    path: routes.rating,
    element: <Rating />,
    route: Route,
  },
  {
    path: routes.stickyNotes,
    element: <Stickynote />,
    route: Route,
  },
  {
    path: routes.textEditor,
    element: <TextEditor />,
    route: Route,
  },
  {
    path: routes.timeLine,
    element: <Timeline />,
    route: Route,
  },
  {
    path: routes.scrollBar,
    element: <Scrollbar />,
    route: Route,
  },
  {
    path: routes.apexChart,
    element: <Apexchart />,
    route: Route,
  },
  {
    path: routes.primeChart,
    element: <PrimeReactChart />,
    route: Route,
  },
  {
    path: routes.chartJs,
    element: <ChartJSExample />,
    route: Route,
  },
  {
    path: routes.featherIcons,
    element: <FeatherIcons />,
    route: Route,
  },
  {
    path: routes.fontawesome,
    element: <FontawesomeIcons />,
    route: Route,
  },
  {
    path: routes.materialIcon,
    element: <MaterialIcons />,
    route: Route,
  },
  {
    path: routes.pe7icon,
    element: <PE7Icons />,
    route: Route,
  },
  {
    path: routes.simpleLineIcon,
    element: <SimplelineIcons />,
    route: Route,
  },
  {
    path: routes.themifyIcon,
    element: <ThemifyIcons />,
    route: Route,
  },
  {
    path: routes.typicon,
    element: <TypiconIcons />,
    route: Route,
  },
  {
    path: routes.basicInput,
    element: <BasicInputs />,
    route: Route,
  },
  {
    path: routes.weatherIcon,
    element: <WeatherIcons />,
    route: Route,
  },
  {
    path: routes.checkboxandRadion,
    element: <CheckboxRadios />,
    route: Route,
  },
  {
    path: routes.inputGroup,
    element: <InputGroup />,
    route: Route,
  },
  {
    path: routes.gridandGutters,
    element: <GridGutters />,
    route: Route,
  },
  {
    path: routes.formSelect,
    element: <FormSelect />,
    route: Route,
  },
  {
    path: routes.formMask,
    element: <FormMask />,
    route: Route,
  },
  {
    path: routes.fileUpload,
    element: <FileUpload />,
    route: Route,
  },
  {
    path: routes.horizontalForm,
    element: <FormHorizontal />,
    route: Route,
  },
  {
    path: routes.verticalForm,
    element: <FormVertical />,
    route: Route,
  },
  {
    path: routes.floatingLable,
    element: <FloatingLabel />,
    route: Route,
  },
  {
    path: routes.formValidation,
    element: <FormValidation />,
    route: Route,
  },
  {
    path: routes.reactSelect,
    element: <FormSelect2 />,
    route: Route,
  },
  {
    path: routes.formWizard,
    element: <FormWizard />,
    route: Route,
  },
  {
    path: routes.formPicker,
    element: <FormPikers />,
    route: Route,
  },
  {
    path: routes.dataTables,
    element: <DataTables />,
    route: Route,
  },
  {
    path: routes.tablesBasic,
    element: <TablesBasic />,
    route: Route,
  },
  {
    path: routes.iconicIcon,
    element: <IonicIcons />,
    route: Route,
  },
  // {
  //   path: routes.chart,
  //   element: <ChartJs />,
  //   route: Route,
  // },

  {
    path: routes.placeholder,
    element: <Placeholder />,
    route: Route,
  },
  {
    path: routes.sweetalert,
    element: <Alert />,
    route: Route,
  },
  {
    path: routes.alert,
    element: <AlertUi />,
    route: Route,
  },
  {
    path: routes.tooltip,
    element: <Tooltips />,
    route: Route,
  },
  {
    path: routes.ribbon,
    element: <Ribbon />,
    route: Route,
  },
  {
    path: routes.categories,
    element: <Categories />,
    route: Route,
  },
  {
    path: routes.budgets,
    element: <Budgets />,
    route: Route,
  },
  {
    path: routes.budgetexpenses,
    element: <BudgetExpenses />,
    route: Route,
  },
  {
    path: routes.budgetrevenues,
    element: <BudgetRevenues />,
    route: Route,
  },
  {
    path: routes.tickets,
    element: <Tickets />,
    route: Route,
  },
  {
    path: routes.ticketGrid,
    element: <TicketGrid />,
    route: Route,
  },
  {
    path: routes.ticketDetails,
    element: <TicketDetails />,
    route: Route,
  },
  {
    path: routes.performanceIndicator,
    element: <PerformanceIndicator />,
    route: Route,
  },
  {
    path: routes.holidays,
    element: <Holidays />,
    route: Route,
  },
  {
    path: routes.performanceReview,
    element: <PerformanceReview />,
    route: Route,
  },
  {
    path: routes.performanceAppraisal,
    element: <PerformanceAppraisal />,
    route: Route,
  },
  {
    path: routes.goalTracking,
    element: <GoalTracking />,
    route: Route,
  },
  {
    path: routes.goalType,
    element: <GoalType />,
    route: Route,
  },
  {
    path: routes.trainingList,
    element: <TrainingList />,
    route: Route,
  },
  {
    path: routes.trainers,
    element: <Trainers />,
    route: Route,
  },
  {
    path: routes.trainingType,
    element: <TrainingType />,
    route: Route,
  },




  // Comment out all LayoutDemo route entries
  // {
  //   path: routes.Horizontal,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.Detached,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.Modern,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.TwoColumn,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.Hovered,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.layoutBox,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.HorizontalSingle,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.HorizontalOverlay,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.HorizontalBox,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.MenuAside,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.Transparent,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.WithoutHeader,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.layoutRtl,
  //   element: <LayoutDemo />,
  // },
  // {
  //   path: routes.layoutDark,
  //   element: <LayoutDemo />,
  // },

  //Settings

  {
    path: routes.profilesettings,
    element: <Profilesettings />,
  },
  {
    path: routes.securitysettings,
    element: <Securitysettings />,
  },
  {
    path: routes.profile,
    element: <Profile />,
  },
  {
    path: routes.notificationssettings,
    element: <Notificationssettings />,
  },
  {
    path: routes.connectedApps,
    element: <ConnectedApps />,
  },
  {
    path: routes.bussinessSettings,
    element: <Bussinesssettings />,
  },
  {
    path: routes.seoSettings,
    element: <Seosettings />,
  },
  {
    path: routes.companySettings,
    element: <CompanySettings />,
  },
  {
    path: routes.localizationSettings,
    element: <Localizationsettings />,
  },
  {
    path: routes.prefixes,
    element: <Prefixes />,
  },
  {
    path: routes.preference,
    element: <Preference />,
  },
  {
    path: routes.authenticationSettings,
    element: <Authenticationsettings />,
  },
  {
    path: routes.aiSettings,
    element: <Aisettings />,
  },
  {
    path: routes.salarySettings,
    element: <Salarysettings />,
  },
  {
    path: routes.approvalSettings,
    element: <Approvalsettings />,
  },
  {
    path: routes.appearance,
    element: <Appearance />,
  },
  {
    path: routes.language,
    element: <Languagesettings />,
  },
  {
    path: routes.languageWeb,
    element: <Languageweb />,
  },
  {
    path: routes.addLanguage,
    element: <Addlanguage />,
  },
  {
    path: routes.invoiceSettings,
    element: <InvoiceSettings />,
  },
  {
    path: routes.customFields,
    element: <CustomFields />,
  },
  {
    path: routes.leaveType,
    element: <LeaveType />,
  },
  {
    path: routes.attendanceSettings,
    element: <AttendanceSettings />,
  },
  {
    path: routes.emailSettings,
    element: <EmailSettings />,
  },
  {
    path: routes.emailTemplates,
    element: <Emailtemplates />,
  },
  {
    path: routes.smsSettings,
    element: <SmsSettings />,
  },
  {
    path: routes.smsTemplate,
    element: <SmsTemplate />,
  },
  {
    path: routes.otpSettings,
    element: <OtpSettings />,
  },
  {
    path: routes.gdprCookies,
    element: <GdprCookies />,
  },
  {
    path: routes.maintenanceMode,
    element: <Maintenancemode />,
  },

  {
    path: routes.paymentGateways,
    element: <PaymentGateways />,
  },
  {
    path: routes.taxRates,
    element: <TaxRates />,
  },
  {
    path: routes.currencies,
    element: <Currencies />,
  },
  {
    path: routes.backup,
    element: <Backup />,
  },
  {
    path: routes.clearcache,
    element: <Clearcache />,
  },
  {
    path: routes.customCss,
    element: <Customcss />,
  },
  {
    path: routes.customJs,
    element: <Customjs />,
  },
  {
    path: routes.cronjob,
    element: <Cronjob />,
  },
  {
    path: routes.Cronjobschedule,
    element: <Cronjobschedule />,
  },
  {
    path: routes.storage,
    element: <Storage />,
  },
  {
    path: routes.rolesPermissions,
    element: <RolesPermissions />,
  },
  {
    path: routes.permissionpage,
    element: <PermissionPage />,
  },
  {
    path: routes.expensesreport,
    element: <ExpensesReport />,
  },
  {
    path: routes.invoicereport,
    element: <InvoiceReport />,
  },
  {
    path: routes.paymentreport,
    element: <PaymentReport />,
  },
  {
    path: routes.projectreport,
    element: <ProjectReport />,
  },
  {
    path: routes.manageusers,
    element: <Manageusers />,
  },
  // {
  //   path: routes.blogs,
  //   element: <Blogs />,
  // },
  {
    path: routes.blogCategories,
    element: <BlogCategories />,
    route: Route,
  },
  {
    path: routes.blogComments,
    element: <BlogComments />,
  },
  {
    path: routes.blogTags,
    element: <BlogTags />,
  },
  {
    path: routes.faq,
    element: <Faq />,
    route: Route,
  },
  {
    path: routes.testimonials,
    element: <Testimonials />,
    route: Route,
  },
  {
    path: routes.profile,
    element: <Profile />,
  },
  {
    path: routes.gallery,
    element: <Gallery />,
  },
  {
    path: routes.searchresult,
    element: <SearchResult />,
  },
  {
    path: routes.timeline,
    element: <TimeLines />,
  },
  {
    path: routes.pricing,
    element: <Pricing />,
  },
  {
    path: routes.apikey,
    element: <ApiKeys />,
  },

  {
    path: routes.privacyPolicy,
    element: <PrivacyPolicy />,
  },
  {
    path: routes.termscondition,
    element: <TermsCondition />,
  },
  {
    path: routes.assetList,
    element: <Assets />,
  },
  {
    path: routes.assetCategories,
    element: <AssetsCategory />,
  },
  {
    path: routes.knowledgebase,
    element: <Knowledgebase />,
  },
  {
    path: routes.activity,
    element: <Activities />,
  },
  {
    path: routes.users,
    element: <Users />,
  },
  {
    path: routes.rolePermission,
    element: <RolesPermission />,
  },
  {
    path: routes.permissionpage,
    element: <Permission />,
  },
  {
    path: routes.invoiceDetails,
    element: <InvoiceDetails />,
  },
  {
    path: routes.taskreport,
    element: <TaskReport />,
  },
  {
    path: routes.userreport,
    element: <UserReports />,
  },
  {
    path: routes.employeereport,
    element: <EmployeeReports />,
  },
  {
    path: routes.employeedetails,
    element: <EmployeeDetails />,
    route: Route,
  },
  {
    path: routes.employeedetailsWithId,
    element: <EmployeeDetails />,
    route: Route,
  },
  {
    path: routes.payslipreport,
    element: <PayslipReport />,
    route: Route,
  },
  {
    path: routes.attendancereport,
    element: <AttendanceReport />,
    route: Route,
  },
  {
    path: routes.leavereport,
    element: <LeaveReport />,
    route: Route,
  },
  {
    path: routes.dailyreport,
    element: <DailyReport />,
    route: Route,
  },
  {
    path: routes.jobgrid,
    element: <JobGrid />,
    route: Route,
  },
  {
    path: routes.joblist,
    element: <JobList />,
    route: Route,
  },
  {
    path: routes.candidatesGrid,
    element: <CandidateGrid />,
    route: Route,
  },
  {
    path: routes.candidateslist,
    element: <CandidatesList />,
    route: Route,
  },
  {
    path: routes.candidateskanban,
    element: <CandidateKanban />,
    route: Route,
  },
  {
    path: routes.refferal,
    element: <RefferalList />,
    route: Route,
  },
  {
    path: routes.clientgrid,
    element: <ClienttGrid />,
    route: Route,
  },
  {
    path: routes.clientlist,
    element: <ClientList />,
    route: Route,
  },
  {
    path: routes.clientdetils,
    element: <ClientDetails />,
    route: Route,
  },
  {
    path: routes.project,
    element: <Project />,
    route: Route,
  },
  {
    path: routes.projectdetails,
    element: <ProjectDetails />,
    route: Route,
  },
  {
    path: routes.projectlist,
    element: <ProjectList />,
    route: Route,
  },
  {
    path: routes.tasks,
    element: <Task />,
    route: Route,
  },
  {
    path: routes.tasksdetails,
    element: <TaskDetails />,
    route: Route,
  },
  {
    path: routes.taskboard,
    element: <TaskBoard />,
    route: Route,
  },
  {
    path: routes.invoices,
    element: <Invoices />,
    route: Route,
  },
  {
    path: routes.invoice,
    element: <Invoices />,
    route: Route,
  },
  {
    path: routes.addinvoice,
    element: <AddInvoice />,
    route: Route,
  },
  {
    path: routes.editinvoice,
    element: <EditInvoice />,
    route: Route,
  },
  {
    path: routes.invoicesdetails,
    element: <InvoiceDetails />,
    route: Route,
  },
  {
    path: routes.payments,
    element: <Payments />,
    route: Route,
  },
  {
    path: routes.expenses,
    element: <Expenses />,
    route: Route,
  },
  {
    path: routes.providentfund,
    element: <ProvidentFund />,
    route: Route,
  },
  {
    path: routes.taxes,
    element: <Taxes />,
    route: Route,
  },
  {
    path: routes.employeesalary,
    element: <EmployeeSalary />,
    route: Route,
  },
  {
    path: routes.payslip,
    element: <PaySlip />,
    route: Route,
  },
  {
    path: routes.payrollAddition,
    element: <PayRoll />,
    route: Route,
  },
  {
    path: routes.payrollOvertime,
    element: <PayRollOvertime />,
    route: Route,
  },
  {
    path: routes.payrollDeduction,
    element: <PayRollDeduction />,
    route: Route,
  },
  {
    path: routes.employeeList,
    element: <EmployeeList />,
    route: Route,
  },
  {
    path: routes.employeeBirthdays,
    element: <EmployeeBirthdays />,
    route: Route,
  },
  {
    path: routes.employeeGrid,
    element: <EmployeesGrid />,
    route: Route,
  },
  {
    path: routes.departments,
    element: <Department />,
    route: Route,
  },
  {
    path: routes.designations,
    element: <Designations />,
    route: Route,
  },
  {
    path: routes.policy,
    element: <Policy />,
    route: Route,
  },
  {
    path: routes.leaveadmin,
    element: <LeaveAdmin />,
    route: Route,
  },
  {
    path: routes.leaveemployee,
    element: <LeaveEmployee />,
    route: Route,
  },
  {
    path: routes.leavesettings,
    element: <LeaveSettings />,
    route: Route,
  },
  {
    path: routes.attendanceadmin,
    element: <AttendanceAdmin />,
    route: Route,
  },
  {
    path: routes.attendanceemployee,
    element: <AttendanceEmployee />,
    route: Route,
  },
  {
    path: routes.timesheet,
    element: <TimeSheet />,
    route: Route,
  },
  {
    path: routes.scheduletiming,
    element: <ScheduleTiming />,
    route: Route,
  },
  {
    path: routes.overtime,
    element: <OverTime />,
    route: Route,
  },

  //crm
  {
    path: routes.contactList,
    element: <ContactList />,
    route: Route,
  },
  {
    path: routes.contactGrid,
    element: <ContactGrid />,
    route: Route,
  },
  {
    path: routes.contactDetails,
    element: <ContactDetails />,
    route: Route,
  },
  {
    path: routes.companiesGrid,
    element: <CompaniesGrid />,
    route: Route,
  },
  {
    path: routes.companiesList,
    element: <CompaniesList />,
    route: Route,
  },
  {
    path: routes.companiesDetails,
    element: <CompaniesDetails />,
    route: Route,
  },
  {
    path: routes.leadsGrid,
    element: <LeadsGrid />,
    route: Route,
  },
  {
    path: routes.leadsList,
    element: <LeadsList />,
    route: Route,
  },
  {
    path: routes.leadsDetails,
    element: <LeadsDetails />,
    route: Route,
  },
  {
    path: routes.dealsGrid,
    element: <DealsGrid />,
    route: Route,
  },
  {
    path: routes.dealsList,
    element: <DealsList />,
    route: Route,
  },
  {
    path: routes.dealsDetails,
    element: <DealsDetails />,
    route: Route,
  },
  {
    path: routes.pipeline,
    element: <Pipeline />,
    route: Route,
  },
  {
    path: routes.analytics,
    element: <Analytics />,
    route: Route,
  },
  {
    path: routes.superAdminCompanies,
    element: <Companies />,
    route: Route,
  },
  {
    path: routes.superAdminSubscriptions,
    element: <Subscription />,
    route: Route,
  },
  {
    path: routes.superAdminPackages,
    element: <Packages />,
    route: Route,
  },
  {
    path: routes.superAdminPackagesGrid,
    element: <PackageGrid />,
    route: Route,
  },
  {
    path: routes.superAdminDomain,
    element: <Domain />,
    route: Route,
  },
  {
    path: routes.superAdminPurchaseTransaction,
    element: <PurchaseTransaction />,
    route: Route,
  },
];

export const authRoutes = [
  {
    path: routes.comingSoon,
    element: <ComingSoon />,
    route: Route,
  },
  {
    path: routes.login,
    element: <Login />,
    route: Route,
  },
  {
    path: routes.login2,
    element: <Login2 />,
    route: Route,
  },
  {
    path: routes.login3,
    element: <Login3 />,
    route: Route,
  },
  {
    path: routes.register,
    element: <Register />,
    route: Route,
  },
  {
    path: routes.twoStepVerification,
    element: <TwoStepVerification />,
    route: Route,
  },
  {
    path: routes.twoStepVerification2,
    element: <TwoStepVerification2 />,
    route: Route,
  },
  {
    path: routes.twoStepVerification3,
    element: <TwoStepVerification3 />,
    route: Route,
  },
  {
    path: routes.emailVerification,
    element: <EmailVerification />,
    route: Route,
  },
  {
    path: routes.emailVerification2,
    element: <EmailVerification2 />,
    route: Route,
  },
  {
    path: routes.emailVerification3,
    element: <EmailVerification3 />,
    route: Route,
  },
  {
    path: routes.register,
    element: <Register />,
    route: Route,
  },
  {
    path: routes.register2,
    element: <Register2 />,
    route: Route,
  },
  {
    path: routes.register3,
    element: <Register3 />,
    route: Route,
  },
  {
    path: routes.resetPassword,
    element: <ResetPassword />,
    route: Route,
  },
  {
    path: routes.resetPassword2,
    element: <ResetPassword2 />,
    route: Route,
  },
  {
    path: routes.resetPassword3,
    element: <ResetPassword3 />,
    route: Route,
  },
  {
    path: routes.forgotPassword,
    element: <ForgotPassword />,
    route: Route,
  },
  {
    path: routes.forgotPassword2,
    element: <ForgotPassword2 />,
    route: Route,
  },
  {
    path: routes.forgotPassword3,
    element: <ForgotPassword3 />,
    route: Route,
  },
  {
    path: routes.error404,
    element: <Error404 />,
    route: Route,
  },
  {
    path: routes.error500,
    element: <Error500 />,
    route: Route,
  },
  {
    path: routes.underMaintenance,
    element: <UnderMaintenance />,
    route: Route,
  },
  {
    path: routes.underConstruction,
    element: <UnderConstruction />,
  },
  {
    path: routes.lockScreen,
    element: <LockScreen />,
  },
  {
    path: routes.resetPasswordSuccess,
    element: <ResetPasswordSuccess />,
  },
  {
    path: routes.resetPasswordSuccess2,
    element: <ResetPasswordSuccess2 />,
  },
  {
    path: routes.resetPasswordSuccess3,
    element: <ResetPasswordSuccess3 />,
  },
];
