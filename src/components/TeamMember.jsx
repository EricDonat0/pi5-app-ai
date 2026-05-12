import { LinkedinIcon } from "./LinkedinIcon";

export function TeamMember({ name, linkedinUrl, isAdvisor = false }) {
    return (
        <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`team-member ${isAdvisor ? "orientador" : ""}`}
        >
            <LinkedinIcon /> {name}
        </a>
    );
}