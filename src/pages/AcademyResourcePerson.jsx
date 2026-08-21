import { Linkedin, Mail, UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ProgressiveImage from "../components/ui/ProgressiveImage";
import { useAcademyResourcePerson } from "../hooks/useAcademyData";
import { resolveMediaUrl } from "../services/mediaService";
import styles from "./Academy.module.css";

export default function AcademyResourcePerson() {
  const { personSlug } = useParams();
  const { data: person, loading, error } = useAcademyResourcePerson(personSlug);
  if (loading)
    return (
      <div className={`container ${styles.pageState}`}>
        <LoadingSkeleton count={2} />
      </div>
    );
  if (error || !person)
    return (
      <div className={`container ${styles.pageState}`}>
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "PATHFINDER Academy", to: "/pathfinder-academy" },
            { label: "Resource person unavailable" },
          ]}
        />
        <h1>{error || "This profile is not available."}</h1>
      </div>
    );
  const image = resolveMediaUrl(person.imagePath);
  return (
    <>
      <SEOHead
        title={`${person.name} · PATHFINDER Academy`}
        description={person.shortBiography}
        path={`/pathfinder-academy/resource-persons/${person.slug}`}
        image={image || undefined}
        type="profile"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: person.name,
          jobTitle: person.professionalTitle,
          description: person.shortBiography,
          image: image || undefined,
          url: `https://grainmuse.net/pathfinder-academy/resource-persons/${person.slug}`,
          worksFor: person.organization
            ? { "@type": "Organization", name: person.organization }
            : undefined,
          affiliation: {
            "@type": "EducationalOrganization",
            name: "PATHFINDER Academy",
          },
          sameAs: person.linkedinUrl ? [person.linkedinUrl] : undefined,
        }}
      />
      <section className={`section-pad ${styles.profileSection}`}>
        <div className="container">
          <Breadcrumbs
            className={styles.profileBreadcrumbs}
            items={[
              { label: "Home", to: "/" },
              { label: "PATHFINDER Academy", to: "/pathfinder-academy" },
              { label: "Resource persons", to: "/pathfinder-academy#resource-persons" },
              { label: person.name },
            ]}
          />
        </div>
        <div className={`container ${styles.profileGrid}`}>
          <div className={styles.profileImage}>
            {image ? (
              <ProgressiveImage
                src={image}
                alt={`${person.name}, ${person.professionalTitle}`}
                eager
              />
            ) : (
              <UserRound />
            )}
          </div>
          <article>
            <p className="section-eyebrow">Resource person</p>
            <h1 className="display-md">{person.name}</h1>
            <h2>{person.professionalTitle}</h2>
            {person.organization && <strong>{person.organization}</strong>}
            <div className={styles.profileBio}>
              {(person.biography || person.shortBiography)
                .split(/\n\s*\n/)
                .map((item) => (
                  <p className={styles.justifiedText} key={item}>
                    {item}
                  </p>
                ))}
            </div>
            {person.expertise?.length > 0 && (
              <div className={styles.tags}>
                {person.expertise.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            )}
            <div className={styles.profileLinks}>
              {person.linkedinUrl && (
                <a href={person.linkedinUrl} target="_blank" rel="noreferrer">
                  <Linkedin /> LinkedIn
                </a>
              )}
              {person.publicEmail && (
                <a href={`mailto:${person.publicEmail}`}>
                  <Mail /> Email
                </a>
              )}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
