import {
  Bone,
  Building2,
  ExternalLink,
  HeartPulse,
  Home,
  MapPin,
  ShieldAlert,
  Users,
} from "lucide-react";

type ResourceProps = {
  category: string;
  name: string;
  url: string;
  description: string;
};

const iconClassName = "text-foreground";

const getCategoryIcon = (category: string) => {
  const normalizedCategory = category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedCategory.includes("desaparecidas")) {
    return <Users className={iconClassName} />;
  }
  if (normalizedCategory.includes("rescate")) {
    return <ShieldAlert className={iconClassName} />;
  }
  if (normalizedCategory.includes("estructurales")) {
    return <Building2 className={iconClassName} />;
  }
  if (normalizedCategory.includes("habitabilidad")) {
    return <Home className={iconClassName} />;
  }
  if (normalizedCategory.includes("acopio")) {
    return <MapPin className={iconClassName} />;
  }
  if (normalizedCategory.includes("aliment")) {
    return <Home className={iconClassName} />;
  }
  if (normalizedCategory.includes("medico")) {
    return <HeartPulse className={iconClassName} />;
  }
  if (normalizedCategory.includes("mascotas")) {
    return <Bone className={iconClassName} />;
  }

  return <ExternalLink className={iconClassName} />;
};

export default function ResourceCard({
  resource,
}: {
  resource: ResourceProps;
}) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card glass-card-hover p-6 rounded-2xl h-full flex flex-col group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="p-3 bg-foreground/10 rounded-xl">
          {getCategoryIcon(resource.category)}
        </div>
        <div className="bg-foreground/10 px-3 py-1 rounded-full border border-foreground/10">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-foreground/70">
            {resource.category}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        {resource.name}
      </h3>
      <p className="text-foreground/70 text-sm flex-1 leading-relaxed">
        {resource.description}
      </p>

      <div className="mt-6 flex items-center text-foreground text-sm font-medium">
        Visitar sitio web
        <ExternalLink
          size={14}
          className="ml-2 transition-transform group-hover:translate-x-1"
        />
      </div>
    </a>
  );
}
