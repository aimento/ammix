<<<<<<< HEAD
import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
<<<<<<< HEAD
import {
=======
import type { ActionArgs } from "@remix-run/node";
import {
  json,
  redirect,
>>>>>>> e85f41e (add : 이미지 업로드)
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
<<<<<<< HEAD
} from "@remix-run/node";
=======
import { unstable_createFileUploadHandler } from "@remix-run/node";
>>>>>>> ad3c40f (add : 이름, 생성일시, 수정일시)
=======
  ActionFunctionArgs,
} from "@remix-run/node";
>>>>>>> e85f41e (add : 이미지 업로드)
import { Users } from "../../models/users.server";
import { Form, useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";
import { sessionCommit } from "~/services/commit.server";
import Avatar from "../components/Avata";

export const imageUploadAction = async ({ request }: ActionArgs) => {
  const uploadHandler = composeUploadHandlers(
    createFileUploadHandler({
      directory: "public/uploads",
    }),
    createMemoryUploadHandler()
  );

  const formData = await parseMultipartFormData(request, uploadHandler);
  const image = formData.get("img");

  if (!image || typeof image === "string") {
    return json({ error: "something wrong", imgSrc: null });
  }

  return json({ error: null, imgSrc: image.name });
};

export const editNameAction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get(session.id);
  let formData = await request.formData();

  if (formData.get("_action") === "nameEdit") {
    const changeFirstName = formData.get("changeFirstName");
    const changeFirstNameValidate = validateValue(
      changeFirstName,
      "change name"
    );
    const changeLastName = formData.get("changeLastName");
    const changeLastNameValidate = validateValue(changeLastName, "change name");

    if (changeFirstNameValidate !== true) {
      const { status } = changeFirstNameValidate;
      const errors = {
        status: status,
        firstName: changeFirstName,
        lastName: changeLastName,
      };
      return json({ errors });
    }

    if (changeLastNameValidate !== true) {
      const { status } = changeLastNameValidate;
      const errors = {
        status: status,
        firstName: changeFirstName,
        lastName: changeLastName,
      };
      return json({ errors });
    }

    const now = new Date();

    await Users.updateOne(
      { _id: sessionId },
      {
        $set: {
          "avatar.firstName": changeFirstName,
          "avatar.lastName": changeLastName,
          updatedAt: now,
          "avatar.imageUrl": `uploads/${image.name}`,
        },
      }
    );

    const headers = await sessionCommit(request, sessionId);

    return redirect("/profile", { headers });
  }
<<<<<<< HEAD

<<<<<<< HEAD
    // const uploadHandler = composeUploadHandlers(
    //   createFileUploadHandler({
    //     directory: "./Desktop/public/uploads",
    //     // maxPartSize: 30000,
    //   }),
    //   createMemoryUploadHandler()
    // );
    // const imageForm = await parseMultipartFormData(request, uploadHandler);
    // const image = imageForm.get("img");
    // if (!image || typeof image === "string") {
    //   return json({ error: "something wrong", imgSrc: null });
    // }

    // return json({ error: null, imgSrc: image.name });
=======
  if (formData.get("_action") === "imageEdit") {
    const changeImage = formData.get("changeImage");
>>>>>>> ad3c40f (add : 이름, 생성일시, 수정일시)

    // const changeImage = formData.get("changeImage");

    //   await Users.updateOne(
    //     { _id: sessionId },
    //     {
    //       $set: {
    //         "avatar.imageUrl": changeImage,
    //       },
    //     }
    //   );

  return null;
}
=======
};
>>>>>>> e85f41e (add : 이미지 업로드)

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const sessionId = session.get(session.id);
  const userData = session.get("userdata");
  if (!userData) {
    return redirect("/sign-in");
  }

  const userInfo = await Users.findOne({ _id: sessionId });
  const avatarImageUrl = userInfo?.avatar?.imageUrl;
  const createdAt = userInfo.createdAt;
  const updatedAt = userInfo.updatedAt;

  const getUserInfo = {
    userId: userData.userId,
    userName: userData.userName,
    userImage: avatarImageUrl,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };

  return json({ data: getUserInfo, userImage: avatarImageUrl });
}

export default function testing() {
  const data = useLoaderData<typeof loader>();

<<<<<<< HEAD
<<<<<<< HEAD
  console.log(data.data.userImage);
=======
  const [showModal, setShowModal] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
>>>>>>> 1e4c259 (add : 테일윈드 적용)

  function onChange(f: any) {
    let file = f.files;

<<<<<<< HEAD
    if (!/\.(png|jpeg)$/i.test(file[0].name)) {
      alert("업로드할 수 없는 파일입니다.\n\n현재 파일 : " + file[0].name);
      file[0].name = ""; // 해당 태그의 파일이름값을 비워준다.
    } else return;
  }
=======
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        // 모달을 열어 지원하지 않는 파일 형식임을 알리기
        setShowModal(true);
        return;
      }
    }
  };

  //모달닫기
  const closeModal = () => {
    setShowModal(false);
  };
>>>>>>> 1e4c259 (add : 테일윈드 적용)

=======
>>>>>>> ad3c40f (add : 이름, 생성일시, 수정일시)
  return (
<<<<<<< HEAD
    <div>
      <Avatar imageUrl={`profile/${data?.imgSrc}`} />
      {/* 유저 아이디 표시 */}
      <label>유저아이디</label>
      {data ? <h4>{data.data.userId}</h4> : null}

      <Form method="POST" action="/profile">
        <div>
          <div>
            <label>이름 :</label>
            <input
              type="text"
<<<<<<< HEAD
              defaultValue={data?.data.userName.firstName}
              name="changeFirstName"
            />
            <input
              type="text"
              defaultValue={data?.data.userName.lastName}
              name="changeLastName"
=======
              defaultValue={data?.data.userName.lastName}
              name="changeLastName"
            />
            <label>성 :</label>
            <input
              type="text"
              defaultValue={data?.data.userName.firstName}
              name="changeFirstName"
>>>>>>> ad3c40f (add : 이름, 생성일시, 수정일시)
            />
=======
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto space-y-4">
            <div className="space-y-2">
              <div className="text-2xl font-semibold">프로필</div>
              <label className="text-lg font-semibold">유저 아이디</label>
              {data ? (
                <h4 className="text-lg font-medium">{data.data.userId}</h4>
              ) : null}
            </div>

            <form method="POST" className="space-y-4">
              <div className="flex space-x-4 items-center">
                <div className="flex flex-col">
                  <label className="text-lg font-medium">성 </label>
                  <input
                    type="text"
                    defaultValue={data?.data.userName.firstName}
                    name="changeFirstName"
                    className="border-2 border-transparent focus:border-blue-400 rounded p-2 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-lg font-medium">이름 </label>
                  <input
                    type="text"
                    defaultValue={data?.data.userName.lastName}
                    name="changeLastName"
                    className="border-2 border-transparent focus:border-blue-400 rounded p-2 focus:outline-none"
                  />
                </div>
              </div>

              <input type="hidden" name="_action" value="nameEdit" />
              <button
                type="submit"
                className="w-full bg-blue-400 text-white py-3 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                이름 수정하기
              </button>
            </form>

            <Form
              method="POST"
              encType="multipart/form-data"
              action="/upload"
              className="flex flex-col space-y-4"
            >
              <div className="flex justify-between items-center">
                <label className="text-xl font-semibold">
                  유저 프로필 업로드
                </label>
                <input
                  type="file"
                  name="img"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileInput"
                  // className="w-full h-12 px-3 mt-1 text-gray-700 placeholder-gray-400 rounded-lg focus:shadow-outline"
                />
                {showModal && (
                  <Modal
                    onClose={closeModal}
                    showCancelButton={false}
                    message="지원하지 않는 파일 형식입니다. png, jpeg, jpg
                  파일만 업로드 가능합니다."
                  />
                )}
                <label
                  htmlFor="fileInput"
                  className="py-2 px-4 bg-white text-blue-500 border border-blue-500 rounded-lg cursor-pointer hover:bg-blue-500 hover:text-white max-w-xs text-center"
                >
                  파일 선택
                </label>
              </div>
              <button
                type="submit"
                name="_action"
                value="imageEdit"
                className="w-full bg-blue-400 text-white py-3 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                프로필 이미지 업로드
              </button>
            </Form>

            {data?.data.userImage ? (
              <div className="my-4 flex justify-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-3">
                    업로드된 이미지
                  </h2>
                  <img
                    alt="uploaded"
                    src={data.data.userImage}
                    className="rounded-lg shadow-md w-64 h-64"
                  />
                </div>
              </div>
            ) : null}

            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="text-lg font-medium">생성 날짜</label>
                <p className="text-lg">
                  {new Date(data?.data.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col">
                <label className="text-lg font-medium">수정 날짜</label>
                <p className="text-lg">
                  {new Date(data?.data.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
>>>>>>> 1e4c259 (add : 테일윈드 적용)
          </div>
        </div>
<<<<<<< HEAD
<<<<<<< HEAD
      </form>
      <br></br>
      <Form method="POST" encType="multipart/form-data" action="/upload">
        <div>
          <br></br>
          <label>UserImage</label>
<<<<<<< HEAD
          <input
            type="file"
            name="img"
            // onChange={onChange(this)}
          />
=======
          <input type="file" name="changeImage" />
>>>>>>> ad3c40f (add : 이름, 생성일시, 수정일시)
          <br></br>
        </div>
        <button type="submit" name="_action" value="imageEdit">
          edit
        </button>
<<<<<<< HEAD
      </Form>
      {data?.data.userImage? (
        <div>
          <h2>uploaded image</h2>
          <img alt="uploaded" src={data.data.userImage} />
        </div>
      ) : null}
=======
        <div>
          <label>생성날짜:</label>{" "}
          {data ? (
            <h4>{new Date(data.data.createdAt).toLocaleString()}</h4>
          ) : null}
          <label>수정날짜:</label>{" "}
          {data ? (
            <h4>{new Date(data.data.updatedAt).toLocaleString()}</h4>
          ) : null}
        </div>
      </form>
>>>>>>> ad3c40f (add : 이름, 생성일시, 수정일시)
=======
      </Form>

      {/* 생성 및 수정 날짜 표시 */}
      <div>
        <label>생성날짜:</label>{" "}
        {data ? (
          <h4>{new Date(data.data.createdAt).toLocaleString()}</h4>
        ) : null}
        <label>수정날짜:</label>{" "}
        {data ? (
          <h4>{new Date(data.data.updatedAt).toLocaleString()}</h4>
        ) : null}
=======
>>>>>>> 1e4c259 (add : 테일윈드 적용)
      </div>
>>>>>>> e85f41e (add : 이미지 업로드)
    </div>
  );
}
