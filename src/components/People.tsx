import Markdown from "react-markdown";
import type { Person } from "../../scripts/people-sheet.mjs";
export type Topic = { id: string; label: string };
const profileUrl = (p: Person) => `#people/${p.id}`;
function Portrait({ person }: { person: Person }) {
  return person.image ? (
    <img
      src={
        /^https?:\/\//i.test(person.image)
          ? person.image
          : import.meta.env.BASE_URL + person.image
      }
      alt={person.name}
      loading="lazy"
    />
  ) : (
    <div
      className="initials"
      aria-label={`${person.name} — no portrait available`}
    >
      {person.name
        .split(" ")
        .map((n) => n[0])
        .join("")}
    </div>
  );
}
function TopicTags({ ids, topics }: { ids: string[]; topics: Topic[] }) {
  return (
    <div className="topic-tags">
      {topics
        .filter((t) => ids.includes(t.id))
        .map((t) => (
          <span className="topic-tag" key={t.id}>
            {t.label}
          </span>
        ))}
    </div>
  );
}
export function PeopleDirectory({
  allPeople,
  topics,
}: {
  allPeople: Person[];
  topics: Topic[];
}) {
  const groups = [...new Set(allPeople.map((p) => p.group))];
  return (
    <section className="shell people-directory">
      <h1 className="sr-only">People</h1>
      <div className="people-list">
        {groups.map((group) => (
          <section className="people-group" key={group}>
            <h2>{group}</h2>
            <div
              className={
                group === "Principal Investigator"
                  ? "pi-grid"
                  : "people-card-grid"
              }
            >
              {allPeople
                .filter((p) => p.group === group)
                .map((p) =>
                  group === "Lab Alumni" ? (
                    <article key={p.id} className="alumni-row">
                      <a href={profileUrl(p)}>
                        <strong>{p.name}</strong>
                      </a>
                      <span>{p.destination}</span>
                    </article>
                  ) : (
                    <article
                      key={p.id}
                      className={
                        group === "Principal Investigator"
                          ? "person pi"
                          : "person"
                      }
                    >
                      <a
                        className="portrait-link"
                        href={profileUrl(p)}
                        aria-label={`View ${p.name}'s profile`}
                      >
                        <Portrait person={p} />
                      </a>
                      <div>
                        <h3>
                          <a href={profileUrl(p)}>{p.name}</a>
                        </h3>
                        <p className="role">{p.role}</p>
                        {p.note && <p className="note">{p.note}</p>}
                        {group === "Principal Investigator" && (
                          <p className="pi-bio">
                            Alan leads the Robotic Exploration Lab at the
                            University of Michigan. His work spans robot
                            navigation, environmental monitoring, marine
                            robotics, and perception in challenging
                            environments. He received his PhD from MIT and the
                            Woods Hole Oceanographic Institution in 2025.
                          </p>
                        )}
                        {group !== "Principal Investigator" && (
                          <TopicTags ids={p.topics} topics={topics} />
                        )}
                        {p.email && <span className="email">{p.email}</span>}
                        <PersonLinks person={p} />
                      </div>
                    </article>
                  ),
                )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
export function PersonProfile({
  id,
  allPeople,
  topics,
}: {
  id: string;
  allPeople: Person[];
  topics: Topic[];
}) {
  const person = allPeople.find((p) => p.id === id);
  if (!person)
    return (
      <section className="shell section">
        <h1 className="profile-title">Profile not found</h1>
        <a className="text-link" href="#people">
          Back to People
        </a>
      </section>
    );
  return (
    <section className="shell profile-page">
      <a className="text-link profile-back" href="#people">
        ← All people
      </a>
      <div className="profile-layout">
        <aside>
          <Portrait person={person} />
          <p className="role">{person.role}</p>
          {person.note && <p className="note">{person.note}</p>}
          {person.destination && <p>{person.destination}</p>}
          {person.email && <span className="email">{person.email}</span>}
          <PersonLinks person={person} />
        </aside>
        <div>
          <h1 className="profile-title">{person.name}</h1>
          {person.group !== "Principal Investigator" && (
            <section className="profile-section">
              <h2>Topics</h2>
              <div className="profile-content">
                <TopicTags ids={person.topics} topics={topics} />
              </div>
            </section>
          )}
          {person.group !== "Lab Alumni" && (
            <>
              <section className="profile-section">
                <h2>Full Bios</h2>
                <div className="profile-content prose">
                  {person.fullBio && <Markdown>{person.fullBio}</Markdown>}
                </div>
              </section>
              <section className="profile-section">
                <h2>Researches</h2>
                <div className="profile-content">
                  {person.researches.map((r) => (
                    <article key={r.title} className="profile-research">
                      <h3>
                        {r.url ? <a href={r.url}>{r.title} ↗</a> : r.title}
                      </h3>
                      <div className="prose">
                        <Markdown>{r.description}</Markdown>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PersonLinks({ person }: { person: Person }) {
  const linkedin =
    person.linkedin ||
    (person.url?.includes("linkedin.com/") ? person.url : "");
  const homepage =
    person.homepage ||
    (person.url && !person.url.includes("linkedin.com/") ? person.url : "");
  if (!linkedin && !homepage) return null;
  return (
    <div className="person-links">
      {linkedin && (
        <a
          href={linkedin}
          aria-label={`${person.name} on LinkedIn`}
          title="LinkedIn"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.53-1.54-2.53-1.54 0-1.77 1.2-1.77 2.45v4.73H9.54V9.2h2.83v1.3h.04c.39-.74 1.36-1.53 2.79-1.53 2.98 0 3.55 1.96 3.55 4.51v5.27Z" />
          </svg>
        </a>
      )}
      {homepage && (
        <a
          href={homepage}
          aria-label={`${person.name} website`}
          title="Homepage"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <circle cx="12" cy="12" r="9" />
            <ellipse cx="12" cy="12" rx="4" ry="9" />
            <path d="M3 12h18M5 6.5h14M5 17.5h14" />
          </svg>
        </a>
      )}
    </div>
  );
}
