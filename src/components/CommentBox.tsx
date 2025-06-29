// src/components/CommentBox.tsx
import React from "react";
import { Comment } from "../types";

export default function CommentBox({ comment }: { comment: Comment }) {
  return (
    <div className="border-b border-gray-200 py-2">
      <p className="text-gray-800">{comment.content}</p>
      <p className="text-gray-500 text-sm">
        {new Date(comment.created_at).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
