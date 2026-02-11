import logo from "../../assets/logo.png";

export const BrandLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = size === "sm" ? 32 : size === "md" ? 48 : 96;

  return (
    <img
      src={logo}
      alt="Brand logo"
      width={dimensions}
      height={dimensions}
      className="shrink-0 object-contain"
    />
  );
};