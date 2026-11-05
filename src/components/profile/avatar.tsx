import Image from "next/image";

type AvatarSize = "small" | "medium" | "large";

type AvatarProps = {
  name: string;
  imageUrl: string | null;
  size?: AvatarSize;
};

const avatarStyles: Record<
  AvatarSize,
  { className: string; pixels: number; textSize: string }
> = {
  small: { className: "size-7", pixels: 28, textSize: "text-xs" },
  medium: { className: "size-10", pixels: 40, textSize: "text-sm" },
  large: { className: "size-20", pixels: 80, textSize: "text-3xl" },
};

export function Avatar({ name, imageUrl, size = "medium" }: AvatarProps) {
  const style = avatarStyles[size];

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-100 ${style.className} ${style.textSize}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={style.pixels}
          height={style.pixels}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        name.trim().charAt(0).toUpperCase() || "A"
      )}
    </span>
  );
}
