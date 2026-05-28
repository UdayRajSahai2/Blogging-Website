import { useParams } from "react-router-dom";

import PageForm from "../../../components/admin/dynamicPages/PageForm";

const EditPage = () => {
  const { id } = useParams();

  return <PageForm pageId={id} />;
};

export default EditPage;
