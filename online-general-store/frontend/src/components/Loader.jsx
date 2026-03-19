export default function Loader({ size = 'md' }) {
  const s = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';
  return (
    <div className="flex justify-center items-center py-10">
      <div className={`${s} border-4 border-primary border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
