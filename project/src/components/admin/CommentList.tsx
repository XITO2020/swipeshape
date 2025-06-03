import React from 'react';
import { Comment } from '../../types'; // Assuming Comment type is in src/types

interface CommentListProps {
  comments: Comment[];
  onDelete: (commentId: number) => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onDelete }) => {
  if (!comments.length) {
    return <p>No comments found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">User</th>
            <th className="py-2 px-4 border-b">Comment</th>
            <th className="py-2 px-4 border-b">Rating</th>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.id}>
              <td className="py-2 px-4 border-b">{comment.user_email || comment.user_id}</td>
              <td className="py-2 px-4 border-b max-w-sm truncate">{comment.content}</td>
              <td className="py-2 px-4 border-b">{comment.rating}</td>
              <td className="py-2 px-4 border-b">{new Date(comment.created_at).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onDelete(comment.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommentList;
