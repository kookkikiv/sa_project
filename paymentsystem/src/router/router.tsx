// AppRouter.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AgodaHeader from '../mainmenu/main.tsx';
import HeaderDemo from '../mainmenu/maindemo.tsx';
import Home from '../pages/home.tsx';
import GuideRegistration from '../pages/guideapplication.tsx';
import DocumentsInfo from '../pages/documentsInfo.tsx';
import WaitingApproval from "../pages/waitingapproval.tsx";
import ApplicationResult from '../pages/applicationresult.tsx';
import Profile from '../pages/profile.tsx';
import Payments from '../pages/payments.tsx';
import CheckPayment from '../pages/checkpayment.tsx';
import CompletePayment from '../pages/completepayment.tsx';



const AppRouter = () => {
  const [useDemoHeader, setUseDemoHeader] = useState(false);

  useEffect(() => {
    const demo = localStorage.getItem('useDemoHeader') === 'true';
    setUseDemoHeader(demo);
  }, []);

  return (
    <BrowserRouter>
      {/* Choose header based on demo flag */}
      {useDemoHeader ? <HeaderDemo /> : <AgodaHeader setUseDemoHeader={setUseDemoHeader} />}
      
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/guideapplication" element={<GuideRegistration />} />
        <Route path="/documents-info" element={<DocumentsInfo />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        <Route path="/application-result" element={<ApplicationResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/check-payment" element={<CheckPayment />} />
        <Route path="/complete-payment" element={<CompletePayment />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
