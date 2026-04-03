import AdminHotbar from "./AdminHotbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHotbar />
      {children}
    </>
  );
}
