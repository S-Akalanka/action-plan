export default function Home() {
  return (
    <main className="flex flex-col gap-4 p-20">
      <h1 className="text-2xl font-bold">Routes</h1>
      <ul>
        <li className="flex flex-col gap-4">
          <a href="/my-plan">My Plan</a>
          <a href="/executive-summary">Executive Summary</a>
        </li>
      </ul>
    </main>
  );
}
