import { useState } from "react";
import {
  BriefcaseIcon,
  HomeIcon,
  BuildingOfficeIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/solid";
import ExperienceList from "./experience/ExperienceList";
import AcademicList from "./academic/AcademicList";
import { Link } from "react-router-dom";

const AboutUser = ({
  bio,
  joinedAt,
  addresses = [],
  details = {},
  experiences = [],
  academics = [],
  interests = [],
  isOwner = false,
  printMode = false,
}) => {
  const normalizedInterests = interests;
  const { employment_status } = details || {};
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 200;

  const isLong = bio && bio.length > MAX_LENGTH;

  const displayBio =
    printMode || expanded || !isLong ? bio : bio?.slice(0, MAX_LENGTH) + "...";

  const employment =
    employment_status === true
      ? "Employed"
      : employment_status === false
        ? "Looking for opportunities"
        : null;

  /* ---------------- ADDRESS LOGIC ---------------- */

  const getAddress = (type) =>
    (addresses || []).find((a) => a.type === type) || {};

  const ADDRESS_CONFIG = [
    { type: "personal", label: "Personal Address", icon: HomeIcon },
    { type: "work", label: "Work Address", icon: BriefcaseIcon },
    { type: "office", label: "Office Address", icon: BuildingOfficeIcon },
  ];

  const infoItems = [
    {
      icon: BriefcaseIcon,
      label: "Employment",
      value: employment,
    },
    ...ADDRESS_CONFIG.map(({ type, label, icon }) => {
      const addr = getAddress(type);
      const format = (str) =>
        str?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

      const value = [
        format(addr.districtDetails?.district_name),
        format(addr.stateDetails?.state_name),
        format(addr.countryDetails?.country_name),
      ]
        .filter(Boolean)
        .join(", ");

      return { icon, label, value };
    }),
  ].filter((item) => item.value);

  /* ---------------- UI ---------------- */

  return (
    <section className="w-full max-w-screen-2xl mx-auto bg-white  px-2 py-2">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
          About
        </h4>
      </div>

      {/* BIO */}
      <div className="mb-4">
        <p className="text-base text-gray-700 leading-relaxed text-justify">
          {bio?.trim() ? (
            <>
              {displayBio}

              {!printMode && isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 text-blue-600 text-sm font-medium hover:underline"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </>
          ) : (
            <span className="italic text-gray-400">
              No description available.
            </span>
          )}
        </p>
      </div>

      {/* INFO */}
      {isOwner && infoItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-2">
          {infoItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex items-center gap-0.5 whitespace-nowrap"
              >
                <Icon className="w-4 h-4 text-sky-400 shrink-0" />

                <div className="flex items-center gap-1 text-sm text-gray-700">
                  <span className="text-[11px]  text-gray-500">
                    {item.label}:
                  </span>

                  <span className="text-[11px] text-gray-800">
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERESTS */}
      <div className="mt-2 pt-3 border-t">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
          Interests
        </h4>

        {interests?.length > 0 ? (
          <div className="text-[13px] leading-6 text-gray-600">
            {normalizedInterests.map((item, index) => (
              <span key={item.interest_id}>
                {index > 0 && <span className="text-indigo-300"> ✦ </span>}
                <span className="font-medium">{item.name}</span>
              </span>
            ))}
          </div>
        ) : isOwner ? (
          <div className="text-sm border rounded-lg p-4 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors duration-200">
            <Link
              to="/settings/edit-profile"
              className="inline-flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-700"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Add Interests
            </Link>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No interests added</p>
        )}
      </div>
      {/* EDUCATION */}
      <div className="mt-2 pt-3 border-t">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
          Education
        </h4>

        {academics?.length > 0 ? (
          <AcademicList
            academics={academics}
            isOwner={isOwner}
            printMode={printMode}
          />
        ) : isOwner && !printMode ? (
          <div className="text-sm border rounded-lg p-4 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors duration-200">
            <Link
              to="/dashboard/academics"
              className="inline-flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-700"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Add Education
            </Link>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No education added</p>
        )}
      </div>

      {/* EXPERIENCE */}
      <div className="mt-2 pt-3 border-t">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
          Experience
        </h4>

        {experiences?.length > 0 ? (
          <ExperienceList
            experiences={experiences}
            isOwner={isOwner}
            printMode={printMode}
          />
        ) : isOwner && !printMode ? (
          <div className="text-sm border rounded-lg p-4 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors duration-200">
            <Link
              to="/dashboard/professional-profile"
              className="inline-flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-700"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Add Experience
            </Link>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No experience added</p>
        )}
      </div>
    </section>
  );
};

export default AboutUser;
