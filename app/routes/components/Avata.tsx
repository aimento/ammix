// app/routes/components/Avatar.tsx
import React from "react";
import { Form } from "@remix-run/react";

const Avatar = ({ onSubmit, error, imgSrc }) => {
  return (
    <>
      <Form method="post" encType="multipart/form-data" onSubmit={onSubmit}>
        <input type="file" name="img" accept="image/*" />
        <button type="submit">Upload Image</button>
      </Form>

      {error ? <h2>{error}</h2> : null}

      {imgSrc ? (
        <>
          <h2>Uploaded Image</h2>
          <img alt="uploaded" src={`upload/${imgSrc}`} />
        </>
      ) : null}
    </>
  );
};

export default Avatar;
