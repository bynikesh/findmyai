import { Link } from 'react-router-dom';
import { BriefcaseIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface JobOrTask {
    id: number;
    name: string;
    slug: string;
    icon?: string;
}

interface JobsTasksSidebarProps {
    jobs?: JobOrTask[];
    tasks?: JobOrTask[];
}

export default function JobsTasksSidebar({ jobs = [], tasks = [] }: JobsTasksSidebarProps) {
    if (jobs.length === 0 && tasks.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Browse Related Tools</h3>

            {/* Jobs Section */}
            {jobs.length > 0 && (
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <BriefcaseIcon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">By Job Role</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {jobs.slice(0, 5).map((job) => (
                            <Link
                                key={job.id}
                                to={`/jobs/${job.slug}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
                            >
                                {job.icon && <span className="text-xs">{job.icon}</span>}
                                {job.name}
                            </Link>
                        ))}
                        {jobs.length > 5 && (
                            <Link
                                to="/jobs"
                                className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                +{jobs.length - 5} more
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Tasks Section */}
            {tasks.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                            <ClipboardDocumentListIcon className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">By Task</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {tasks.slice(0, 5).map((task) => (
                            <Link
                                key={task.id}
                                to={`/tasks/${task.slug}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition-colors"
                            >
                                {task.icon && <span className="text-xs">{task.icon}</span>}
                                {task.name}
                            </Link>
                        ))}
                        {tasks.length > 5 && (
                            <Link
                                to="/tasks"
                                className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                +{tasks.length - 5} more
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* See All Links */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                    to="/jobs"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                    All Jobs →
                </Link>
                <Link
                    to="/tasks"
                    className="text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                    All Tasks →
                </Link>
            </div>
        </div>
    );
}
