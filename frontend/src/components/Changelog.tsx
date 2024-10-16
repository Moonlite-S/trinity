import { useEffect, useState } from "react"
import { getChangelogProjects } from "../api/changelogs"
import { ChangelogProjectProps } from "../interfaces/changelog"

/**
 * Still deciding whether this will be here or just in the backend
 * 
 */
export function Changelog() {
    const [changelogProjects, setChangelogProjects] = useState<ChangelogProjectProps[]>([])

    useEffect(() => {
        const getChangelog = async () => {
            const response = await getChangelogProjects()
            setChangelogProjects(response)
        }

        getChangelog()
    }, [])

    console.log(changelogProjects)

    return (
        <div>
            <h1>Changelog</h1>

            {changelogProjects.length > 0 ? 
                <div>
                    {changelogProjects.map((project) => (
                        <div key={project.project_id}>
                            <h2>{project.project_name}</h2>
                            <p>{project.change_description}</p>
                        </div>
                    ))}
                </div>
            : (
                <div>
                    <h2>No changes yet</h2>
                </div>
            )}
        </div>
    )
}