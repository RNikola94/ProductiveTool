import { Outlet } from "react-router-dom";
import Navigation from "../components/navigation/Navigation.component";
import Footer from "../components/footer/Footer.component";
import ToastNotifications from "../components/toast-notification/ToastNotification.component";

export default function RootLayout() {
    return (
        <div className="root-layouot">
            <Navigation />
            <main>
                <Outlet />
                <ToastNotifications />
            </main>
            <Footer />
        </div>
    )
}