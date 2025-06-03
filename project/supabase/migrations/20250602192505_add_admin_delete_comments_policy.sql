-- Policy for users to delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for admins to delete any comment
CREATE POLICY "Admins can delete any comment"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%admin%');
