type Props = {
  text?: string
  size?: "sm" | "md" | "lg"
}

export default function Loading({ text = "Loading...", size = "sm" }: Props) {
  const sizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  }

  return (
    <div className={`text-gray-400 ${sizeClass[size]}`}>
      {text}
    </div>
  )
}
