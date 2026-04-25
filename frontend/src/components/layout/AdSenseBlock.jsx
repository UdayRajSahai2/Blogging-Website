import { useEffect } from "react";
//Replace data-ad-client & data-ad-slot with real values.

const AdSenseBlock = ({ showAds = false }) => {
  useEffect(() => {
    if (showAds) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    }
  }, [showAds]);

  return (
    <div className="col-span-2 rounded-lg p-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 border shadow-sm text-center">
      <p className="text-[11px] font-medium text-indigo-500 mb-1 tracking-wide">
        Advertise with us
      </p>

      {showAds ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXX"
          data-ad-slot="XXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        /* Dummy Ad */
        <div className="h-24 flex flex-col items-center justify-center from-indigo-100 to-blue-100 text-[12px] text-indigo-700">
          <p className="font-semibold">Your Ad Here</p>
        </div>
      )}
    </div>
  );
};

export default AdSenseBlock;
