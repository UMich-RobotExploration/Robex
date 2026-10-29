import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";
import { PeopleDirectory, PersonProfile } from "./components/People";
import { useSheet } from "./hooks/useSheet";
import { mergeNews, sortNews, type News } from "../scripts/content-sheets.mjs";
import { usePeople } from "./hooks/usePeople";
import research from "./content/research.json";
import newsData from "./content/news.json";
import publicationData from "./content/publications.json";
import about from "./content/about.md?raw";
import "./styles.css";

type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: number;
  url: string;
};
const publications: Publication[] = publicationData;
const pages = [
  "Home",
  "Research",
  "People",
  "Publications",
  "News",
  "Contact",
] as const;
type Page = (typeof pages)[number];
const slug = (name: string) => name.toLowerCase().replaceAll(" ", "-");
const getPage = (): Page =>
  location.hash === "#join-us"
    ? "Contact"
    : (pages.find((p) => slug(p) === location.hash.slice(1).split("/")[0]) ??
      "Home");
const asset = (path: string) => import.meta.env.BASE_URL + path;
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function Logo() {
  return (
    <span className="logo-crop">
      <img
        src={asset("robex-logo.png")}
        alt="RobEx — Robotic Exploration Lab"
      />
    </span>
  );
}
const initialNews = sortNews(newsData);
function App() {
  const news = useSheet<News[]>("News", initialNews, mergeNews);
  const { allPeople, topics } = usePeople();
  const [page, setPage] = useState<Page>(getPage);
  const [menu, setMenu] = useState(false);
  const [profileId, setProfileId] = useState(() =>
    location.hash.startsWith("#people/") ? location.hash.slice(8) : "",
  );
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => {
      setPage(getPage());
      setProfileId(
        location.hash.startsWith("#people/") ? location.hash.slice(8) : "",
      );
      setMenu(false);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => main.current?.focus({ preventScroll: true }));
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    document.title = `${profileId ? (allPeople.find((p) => p.id === profileId)?.name ?? "Profile not found") : page === "Home" ? "Robotic Exploration Lab" : page} | Robex · University of Michigan`;
  }, [page, profileId, allPeople]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <>
      <a
        className="skip"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="shell header">
        <a href="#home" className="logo-link" aria-label="Robex home">
          <Logo />
        </a>
        <button
          className="menu-toggle"
          aria-expanded={menu}
          aria-controls="navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Close ✕" : "Menu ☰"}
        </button>
        <nav
          id="navigation"
          aria-label="Main navigation"
          className={menu ? "nav open" : "nav"}
        >
          {pages.map((p) => (
            <a
              key={p}
              href={"#" + slug(p)}
              aria-current={page === p ? "page" : undefined}
            >
              {p}
            </a>
          ))}
        </nav>
      </header>
      <main id="main-content" ref={main} tabIndex={-1}>
        {page === "Home" && (
          <>
            <section className="shell hero">
              <div className="hero-copy">
                <p className="eyebrow">ROBOTICS FOR THE NATURAL WORLD</p>
                <h1>
                  Explore.
                  <br />
                  Understand.
                  <br />
                  <span>Go further.</span>
                </h1>
                <p className="hero-description">
                  Autonomous systems to explore, study, and understand the world
                  around us.
                </p>
                <a className="button" href="#research">
                  Explore our research <span aria-hidden="true">→</span>
                </a>
                <div className="hero-foot">
                  <strong>ROBEX</strong>
                  <div className="hero-affiliation">
                    <span>University of Michigan · Ann Arbor</span>
                    <span>
                      Naval Architecture &amp; Marine Engineering (NAME)
                    </span>
                  </div>
                </div>
              </div>
              <figure className="hero-photo">
                <img
                  src={asset("alan-papalia.jpg")}
                  alt="Alan Papalia beside robotic research vessels on a dock along the Charles River"
                  fetchPriority="high"
                />
                <figcaption>
                  <span>FROM ALGORITHMS TO THE FIELD</span>
                  <span>Marine robotics & exploration</span>
                </figcaption>
              </figure>
            </section>
            <section className="shell home-news">
              <div className="section-heading">
                <div>
                  <h2>Latest news</h2>
                </div>
                <a className="text-link" href="#news">
                  All news <Arrow />
                </a>
              </div>
              <NewsRows news={news.slice(0, 3)} compact />
            </section>
            <section className="shell intro section">
              <p className="eyebrow">OUR LAB</p>
              <div>
                <h2>
                  Big questions.
                  <br />
                  Real-world exploration.
                </h2>
                <div className="prose">
                  <Markdown>{about}</Markdown>
                </div>
              </div>
            </section>
            <section className="research-band">
              <div className="shell section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">WHAT WE WORK ON</p>
                    <h2>Research directions</h2>
                  </div>
                  <a className="text-link" href="#research">
                    Our research <Arrow />
                  </a>
                </div>
                <ResearchCards />
              </div>
            </section>
          </>
        )}
        {page === "Research" && (
          <>
            <PageHeading
              eyebrow="RESEARCH"
              title="Autonomy for exploration."
              text="From reliable navigation to environmental observation, we build the foundations for robots that work in the natural world."
            />
            <section className="shell section pt-0">
              <ResearchCards />
              <div className="research-feature">
                <img
                  src={asset("alan-papalia.jpg")}
                  alt="Alan Papalia with research vessels at a riverside dock"
                />
                <div>
                  <p className="eyebrow">OUR PERSPECTIVE</p>
                  <h2>
                    Robotics meets
                    <br />
                    the environment.
                  </h2>
                  <div className="prose">
                    <Markdown>{about}</Markdown>
                  </div>
                  <a
                    className="text-link"
                    href="https://www.climate-robotics.org/"
                  >
                    Roadmap for Climate-Relevant Robotics Research <Arrow />
                  </a>
                </div>
              </div>
            </section>
            <JoinBanner />
          </>
        )}
        {page === "People" &&
          (profileId ? (
            <PersonProfile
              id={profileId}
              allPeople={allPeople}
              topics={topics}
            />
          ) : (
            <PeopleDirectory allPeople={allPeople} topics={topics} />
          ))}
        {page === "Publications" && (
          <>
            <PageHeading
              eyebrow="PUBLICATIONS"
              title="Ideas, shared."
              text="Research on robot navigation, perception, and environmental exploration."
            />
            <section className="shell section pt-0">
              {publications.length > 0 && (
                <div className="mb-16">
                  {[...publications]
                    .sort((a, b) => b.year - a.year)
                    .map((p) => (
                      <article className="publication" key={p.title}>
                        <span>{p.year}</span>
                        <div>
                          <h2>
                            <a href={p.url}>
                              {p.title} <Arrow />
                            </a>
                          </h2>
                          <p>{p.authors}</p>
                          <p>{p.venue}</p>
                        </div>
                      </article>
                    ))}
                </div>
              )}
              <div className="publication-source">
                <p className="eyebrow">PUBLICATION RECORD</p>
                <h2>Browse our research.</h2>
                <p>
                  Find Alan Papalia’s publications and citation record on Google
                  Scholar.
                </p>
                <a
                  className="button"
                  href="https://scholar.google.com/citations?user=Ym3SpKgAAAAJ"
                >
                  View Google Scholar <Arrow />
                </a>
              </div>
              <div className="mt-14">
                <p className="eyebrow">A BROADER PERSPECTIVE</p>
                <h2 className="mt-4 mb-5">Robotics for a changing planet.</h2>
                <p className="max-w-2xl mb-6 text-slate-600">
                  Explore the Roadmap for Climate-Relevant Robotics Research,
                  coauthored by Alan Papalia and collaborators.
                </p>
                <a
                  className="text-link"
                  href="https://www.climate-robotics.org/"
                >
                  Visit the roadmap <Arrow />
                </a>
              </div>
            </section>
          </>
        )}
        {page === "News" && (
          <>
            <section className="shell compact-heading">
              <h1>News</h1>
              <p>Updates and highlights from RobEx.</p>
            </section>
            <section className="shell news-page">
              <NewsRows news={news} />
            </section>
          </>
        )}
        {page === "Contact" && (
          <>
            <PageHeading
              eyebrow="CONTACT"
              title="Let’s connect."
              text="Research collaborations, opportunities, and questions about RobEx."
            />
            <section className="shell section pt-0 join-layout">
              <div>
                {[
                  {
                    title: "Prospective PhD students",
                    body: "Interested in robot navigation, perception, or environmental autonomy? Read the current application guidance and research opportunities before reaching out.",
                  },
                  {
                    title: "Postdoctoral researchers",
                    body: "Explore opportunities to develop an independent research agenda aligned with field robotics and environmental exploration.",
                  },
                  {
                    title: "University of Michigan students",
                    body: "Undergraduate research can range from developing and deploying robotic platforms to working on localization, perception, and planning.",
                  },
                ].map((x) => (
                  <article className="join-item" key={x.title}>
                    <h2>{x.title}</h2>
                    <p>{x.body}</p>
                  </article>
                ))}
              </div>
              <aside className="contact-box">
                <p className="eyebrow">GET IN TOUCH</p>
                <h2>Start a conversation.</h2>
                <p>
                  Visit Alan’s opportunities page for current requirements and
                  instructions.
                </p>
                <div className="contact-actions">
                  <a
                    className="button"
                    href="https://alanpapalia.github.io/join/"
                  >
                    Application guidance <Arrow />
                  </a>
                  <span className="contact-email">
                    apapalia (at) umich (dot) edu
                  </span>
                </div>
                <p className="contact-address">
                  Naval Architecture & Marine Engineering
                  <br />
                  University of Michigan
                  <br />
                  Ann Arbor, Michigan
                </p>
              </aside>
            </section>
          </>
        )}
      </main>
      <footer>
        <div className="shell footer-inner">
          <div>
            <a
              href="#home"
              className="logo-link footer-logo"
              aria-label="Robex home"
            >
              <Logo />
            </a>
            <p>Robotic Exploration Lab</p>
          </div>
          <div>
            <p>
              <a href="https://umich.edu/">University of Michigan</a>
            </p>
            <p>
              <a href="https://name.engin.umich.edu/">
                Naval Architecture & Marine Engineering
              </a>
            </p>
            <p>Ann Arbor, Michigan</p>
          </div>
          <div className="footer-links">
            <a href="#people">People</a>
            <a href="#publications">Publications</a>
            <a href="#news">News</a>
            <a href="#contact">
              Contact <Arrow />
            </a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© {new Date().getFullYear()} Robotic Exploration Lab</span>
          <a href="https://www.engin.umich.edu/">
            Michigan Engineering <Arrow />
          </a>
        </div>
      </footer>
    </>
  );
}
function PageHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="shell page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
function ResearchCards() {
  return (
    <div className="research-grid">
      {research.map((r) => (
        <article key={r.number} className="research-card">
          <span className="research-number">{r.number}</span>
          <p className="research-tag">{r.tag}</p>
          <h3>{r.title}</h3>
          <p>{r.description}</p>
        </article>
      ))}
    </div>
  );
}
function JoinBanner() {
  return (
    <section className="shell join-banner">
      <div>
        <p className="eyebrow">EXPLORE WITH US</p>
        <h2>Good questions take a team.</h2>
      </div>
      <a className="button" href="#contact">
        Join Robex <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

function NewsRows({
  news,
  compact = false,
}: {
  news: News[];
  compact?: boolean;
}) {
  return (
    <>
      {news.map((n) => {
        const content = (
          <>
            <span className="news-date">{n.date}</span>
            <div>
              {!compact && n.type && (
                <span className="news-type">{n.type}</span>
              )}
              <h3>{n.title}</h3>
              {compact ? (
                n.tldr && <p className="news-tldr">{n.tldr}</p>
              ) : (
                <p>{n.text}</p>
              )}
            </div>
            {n.url && <Arrow />}
          </>
        );
        return n.url ? (
          <a
            className={compact ? "news-row news-row-compact" : "news-row"}
            href={n.url}
            key={n.id}
          >
            {content}
          </a>
        ) : (
          <article
            className={compact ? "news-row news-row-compact" : "news-row"}
            key={n.id}
          >
            {content}
          </article>
        );
      })}
    </>
  );
}
