import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { I18nProvider, I18nRuntime } from "./i18n/I18nProvider";
import { ClientThemeProvider } from "./theme/ClientThemeProvider";
import { AnalyticsPage } from "./pages/admin/AnalyticsPage";
import { AvatarBadgesPage } from "./pages/admin/AvatarBadgesPage";
import { CRMPage } from "./pages/admin/CRMPage";
import { CpsPage } from "./pages/admin/CpsPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { DataCenterPage } from "./pages/admin/DataCenterPage";
import { DecorationPage } from "./pages/admin/DecorationPage";
import { DispatchPage } from "./pages/admin/DispatchPage";
import { FieldJobsPage } from "./pages/admin/FieldJobsPage";
import { FinancePage } from "./pages/admin/FinancePage";
import { FloorplanPage } from "./pages/admin/FloorplanPage";
import { ImChatPage } from "./pages/admin/ImChatPage";
import { InventoryPage } from "./pages/admin/InventoryPage";
import { MarketingPage } from "./pages/admin/MarketingPage";
import { MerchantsPage } from "./pages/admin/MerchantsPage";
import { OrdersAdminPage } from "./pages/admin/OrdersAdminPage";
import { ReviewsPage } from "./pages/admin/ReviewsPage";
import { RolesPage } from "./pages/admin/RolesPage";
import { TechniciansPage } from "./pages/admin/TechniciansPage";
import { MerchantPortalPage } from "./pages/mobile/MerchantPortalPage";
import { MomentsPage } from "./pages/mobile/MomentsPage";
import { NeedoExchangePage } from "./pages/mobile/NeedoExchangePage";
import { TechnicianPortalPage } from "./pages/mobile/TechnicianPortalPage";
import { CategoryPage } from "./pages/user/CategoryPage";
import { CheckoutPage } from "./pages/user/CheckoutPage";
import { ContactsPage } from "./pages/user/ContactsPage";
import { HomePage } from "./pages/user/HomePage";
import { MessagesPage } from "./pages/user/MessagesPage";
import { SearchPage } from "./pages/user/SearchPage";
import { ServiceDetailPage } from "./pages/user/ServiceDetailPage";
import { ServiceListPage } from "./pages/user/ServiceListPage";
import { StoreDetailPage } from "./pages/user/StoreDetailPage";
import { StoreListPage } from "./pages/user/StoreListPage";
import { SupportPage } from "./pages/user/SupportPage";
import { UserCenterPage } from "./pages/user/UserCenterPage";
import { UserOrdersPage } from "./pages/user/UserOrdersPage";
import { TravelSettingsPage } from "./pages/admin/TravelSettingsPage";

type FrontPortal = "user" | "merchant" | "technician";

function getFrontPortal(pathname: string): FrontPortal | null {
  if (pathname.startsWith("/admin")) {
    return null;
  }

  if (pathname.startsWith("/merchant")) {
    return "merchant";
  }

  if (pathname.startsWith("/technician")) {
    return "technician";
  }

  return "user";
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  return null;
}

const splashCopy: Record<FrontPortal, { label: string; caption: string }> = {
  user: { label: "用户端", caption: "发现服务、预约门店、联系技师" },
  merchant: { label: "商户端", caption: "订单、排班、客户与门店运营" },
  technician: { label: "技师端", caption: "任务、日程、导航与收入管理" }
};

function SplashScreen({ onDone, portal }: { onDone: () => void; portal: FrontPortal }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1300);

    return () => window.clearTimeout(timer);
  }, [onDone]);
  const copy = splashCopy[portal];

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-[#e7d3b6]">
      <div className="h-full w-full max-w-[480px] overflow-hidden bg-[#e7d3b6] shadow-soft">
        <img
          alt={`NeeDo ${copy.label} Loading - ${copy.caption}`}
          className="h-full w-full object-cover"
          src="/images/login.png"
        />
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const currentPortal = getFrontPortal(location.pathname);
  const [splashPortal, setSplashPortal] = useState<FrontPortal | null>(currentPortal);
  const [lastPortal, setLastPortal] = useState<FrontPortal | null>(null);

  useEffect(() => {
    if (!currentPortal) {
      setSplashPortal(null);
      setLastPortal(null);
      return;
    }

    if (currentPortal !== lastPortal) {
      setSplashPortal(currentPortal);
      setLastPortal(currentPortal);
    }
  }, [currentPortal, lastPortal]);

  const completeSplash = () => {
    setSplashPortal(null);
  };

  return (
    <I18nProvider>
      <ClientThemeProvider>
        <I18nRuntime>
          {splashPortal ? <SplashScreen onDone={completeSplash} portal={splashPortal} /> : null}
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/services" element={<ServiceListPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/stores" element={<StoreListPage />} />
          <Route path="/stores/:id" element={<StoreDetailPage />} />
          <Route path="/checkout/:serviceId" element={<CheckoutPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/moments" element={<MomentsPage />} />
          <Route path="/needo" element={<NeedoExchangePage />} />
          <Route path="/orders" element={<UserOrdersPage />} />
          <Route path="/me" element={<UserCenterPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/merchant" element={<MerchantPortalPage />} />
          <Route path="/merchant/needo" element={<NeedoExchangePage context="merchant" />} />
          <Route path="/merchant/moments" element={<MomentsPage context="merchant" />} />
          <Route path="/merchant/:view" element={<MerchantPortalPage />} />
          <Route path="/technician" element={<TechnicianPortalPage />} />
          <Route path="/technician/needo" element={<NeedoExchangePage context="technician" />} />
          <Route path="/technician/moments" element={<MomentsPage context="technician" />} />
          <Route path="/technician/:view" element={<TechnicianPortalPage />} />

          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/data" element={<DataCenterPage />} />
          <Route path="/admin/badges" element={<AvatarBadgesPage />} />
          <Route path="/admin/decoration" element={<DecorationPage />} />
          <Route path="/admin/technicians" element={<TechniciansPage />} />
          <Route path="/admin/orders" element={<OrdersAdminPage />} />
          <Route path="/admin/dispatch" element={<DispatchPage />} />
          <Route path="/admin/field-jobs" element={<FieldJobsPage />} />
          <Route path="/admin/crm" element={<CRMPage />} />
          <Route path="/admin/cps" element={<CpsPage />} />
          <Route path="/admin/marketing" element={<MarketingPage />} />
          <Route path="/admin/im" element={<ImChatPage />} />
          <Route path="/admin/finance" element={<FinancePage />} />
          <Route path="/admin/reviews" element={<ReviewsPage />} />
          <Route path="/admin/merchants" element={<MerchantsPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
          <Route path="/admin/floorplan" element={<FloorplanPage />} />
          <Route path="/admin/roles" element={<RolesPage />} />
          <Route path="/admin/travel-settings" element={<TravelSettingsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </I18nRuntime>
      </ClientThemeProvider>
    </I18nProvider>
  );
}
