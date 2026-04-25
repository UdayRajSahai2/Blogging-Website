import { useNavigate, NavLink } from "react-router-dom";

const ReachInitiativesCard = ({ userAuth, donorProfile }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        if (!userAuth?.access_token) {
          navigate("/signup");
        }
      }}
      className="rounded-lg px-3 pt-0.5 pb-0.5 sm:px-4 sm:pt-0.5 sm:pb-0.5 
bg-gradient-to-br from-emerald-50 to-green-50 
border border-emerald-100 shadow-sm cursor-pointer"
    >
      {/* TITLE */}
      <p className=" text-base sm:text-lg font-semibold text-emerald-700 text-center">
        REACH Initiatives
      </p>

      {/* LIST */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto text-[12px] sm:text-sm text-gray-700">
        <span className="cursor-pointer hover:text-emerald-600 transition">
          Donate to pay back to society
        </span>

        <span className="cursor-pointer hover:text-emerald-600 transition">
          Adopt & educate a child
        </span>

        <span className="cursor-pointer hover:text-emerald-600 transition">
          Collections & expenses
        </span>
      </div>

      {/* LOGGED IN */}
      {userAuth?.access_token && (
        <div className="mt-3 pt-3 border-t border-emerald-100 space-y-2">
          {donorProfile && (
            <>
              <p className="text-emerald-600 text-sm leading-tight">
                ✅ {donorProfile.subscription_type} donor
              </p>

              <p className="text-gray-500 text-xs leading-tight">
                Cause: {donorProfile.purpose}
              </p>
            </>
          )}

          <NavLink
            to="/dashboard/donor"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-emerald-500 text-white px-3 py-2 rounded-md text-sm text-center block hover:bg-emerald-600 transition"
          >
            {donorProfile ? "Make a donation" : "Register as Donor"}
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default ReachInitiativesCard;
