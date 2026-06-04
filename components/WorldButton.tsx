interface WorldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function WorldButton({ children, className, ...props }: WorldButtonProps) {
  return (
    <button
      className={`px-6 py-2 transition-all duration-300 hover:opacity-80 active:scale-95 ${className}`}
      style={{
        borderRadius: 'var(--btn-radius)',
        border: 'var(--btn-border)',
        boxShadow: 'var(--btn-shadow)',
        background: 'var(--surface)',
        color: 'var(--text)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}