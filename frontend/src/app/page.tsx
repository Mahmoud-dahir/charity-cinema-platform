export default async function Home() {
  let message = 'Could not connect to backend...';
  
  try {
    const res = await fetch('http://127.0.0.1:8000/api/hello-db/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      message = data.content;
    }
  } catch (error) {
    console.error("Failed to fetch from backend:", error);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Initial deployment v1</h1>
        </div>
        <div className="p-6">
          <p className="text-sm tracking-wide font-semibold text-gray-500 uppercase mb-2">Message from Database</p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            <p className="text-lg text-blue-900 font-medium">{message}</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span>Successfully connected to the backend</span>
          </div>
        </div>
      </div>
    </main>
  );
}
