interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
        {title}
      </h1>
      <p className="text-lg text-slate-300">
        {description}
      </p>
    </div>
  );
}

