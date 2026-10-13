import { skills } from "@/content/skills";
import { Section } from "@/components/ui/Section";
import type { SkillGroup } from "@/types/content";

/** Core groups carry the frontend positioning; within them, the strongest items are heavier. */
function CoreGroup({ group, index }: { group: SkillGroup; index: number }) {
  return (
    <li data-reveal style={{ "--reveal-i": index % 3 } as React.CSSProperties} className="bg-abyss p-6">
      <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{group.name}</h3>
      <ul className="mt-4 space-y-1.5">
        {group.items.map((item) => {
          const strong = group.core.includes(item);
          return (
            <li key={item} className={`break-words ${strong ? "text-[15px] font-medium text-white" : "text-sm text-mist"}`}>
              {item}
            </li>
          );
        })}
      </ul>
    </li>
  );
}

/** Supporting groups: smaller and quieter, so backend and cloud support the positioning rather than compete with it. */
function SupportingGroup({ group }: { group: SkillGroup }) {
  return (
    <li className="rounded-lg border border-line/70 p-5">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist">{group.name}</h3>
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-mist">
        {group.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </li>
  );
}

export function Skills() {
  const core = skills.filter((group) => group.tier === "core");
  const supporting = skills.filter((group) => group.tier === "supporting");

  return (
    <Section id="skills" index="05" label="Skills" title="Frontend first, grouped by what each skill is for.">
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {core.map((group, index) => (
          <CoreGroup key={group.name} group={group} index={index} />
        ))}
      </ul>
      <p data-reveal className="mb-3 mt-10 font-mono text-xs uppercase tracking-[0.16em] text-mist">
        Supporting
      </p>
      <ul data-reveal className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {supporting.map((group) => (
          <SupportingGroup key={group.name} group={group} />
        ))}
      </ul>
    </Section>
  );
}
