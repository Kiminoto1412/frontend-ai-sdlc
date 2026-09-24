"use client";

import SwaggerUIReact from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerUI({ url }: { url: string }) {
  return (
    <SwaggerUIReact
      url={url}
      docExpansion="list"
      defaultModelsExpandDepth={1}
      tryItOutEnabled
    />
  );
}
