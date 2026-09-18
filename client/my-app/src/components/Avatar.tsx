type Props = {
  name: string;
  size?: "sm" | "md";
};

const COLORS = [
  "bg-teal-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-teal-500",
];

function getColorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, size = "sm" }: Props) {
  const sizeClasses = size === "sm" ? "w-6 h-6 text-[10px]" : "w-9 h-9 text-sm";

  return (
    <div
      className={`${sizeClasses} ${getColorForName(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
