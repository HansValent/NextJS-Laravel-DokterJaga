import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ accessToken?: string; message?: string }>; // 🌟 Tambahkan 'message' di sini
}) {
  const { accessToken, message } = await searchParams; // 🌟 Ambil nilainya
  
  // 🌟 Oper nilainya sebagai props ke LoginForm
  return <LoginForm accessToken={accessToken} message={message} />;
}