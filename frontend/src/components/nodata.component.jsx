//frontend\src\components\nodata.component.jsx
const NoDataMessage = ({ message }) => {
  return (
    <div className="w-full text-center p-4 rounded-lg bg-grey/15 mt-4 ">
      <p>{message}</p>
    </div>
  );
};
export default NoDataMessage;
