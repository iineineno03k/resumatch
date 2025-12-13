import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillTagProps {
  name: string;
  className?: string;
}

export function SkillTag({ name, className }: SkillTagProps) {
  return (
    <Badge variant="outline" className={cn("font-normal", className)}>
      {name}
    </Badge>
  );
}

interface SkillTagListProps {
  skills: string[];
  className?: string;
  maxDisplay?: number;
}

export function SkillTagList({
  skills,
  className,
  maxDisplay,
}: SkillTagListProps) {
  const displaySkills = maxDisplay ? skills.slice(0, maxDisplay) : skills;
  const remaining = maxDisplay ? skills.length - maxDisplay : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {displaySkills.map((skill) => (
        <SkillTag key={skill} name={skill} />
      ))}
      {remaining > 0 && (
        <Badge variant="secondary" className="font-normal">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
