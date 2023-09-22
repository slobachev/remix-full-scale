import type { Logline } from "@prisma/client";
import { Form, Link } from "@remix-run/react";


export default function LoglineDisplay({ 
        canDelete = true, 
        isOwner, 
        logline 
    }: { 
        canDelete?: boolean, 
        isOwner: boolean, 
        logline: Pick<Logline, 'content' | 'name'> 
    }) {
  return (
    <div>
      <p>Here's your fantastic logline:</p>
      <p>{logline.content}</p>
      <Link to=".">"{logline.name}" Permalink</Link>
      {isOwner && 
        <Form method="post">
            <button
                className="button"
                name="_action"
                type="submit"
                value="delete"
                disabled={!canDelete}
            >
                Delete
            </button>
        </Form>
      }
    </div>
  );
}