import Message from './Message'
import { FaPlusCircle } from 'react-icons/fa';
import { User } from '../types'

type Props = {
    user: User
}

export default function UserDisplay({ user }: Props) {

    return <div className="flex gap-x-24 justify-center">
        <div className="rounded-md  flex justify-center items-center drop-shadow-md bg-orange-300 shadow-sm shadow-orange-600 w-48 h-20">
            <p className="text-xl text-black font-bold">
                {user.name}
            </p>
        </div>
        <div>
            {user.notes.map((message, i) => <Message key={i} index={i} note={message} />)}
            <button className="group flex justify-center w-full border-2 rounded-lg p-2 border-neutral-900 bg-sky-500 bg-opacity-70 border-opacity-50 transition ease-in-out duration-300 hover:bg-opacity-100 hover:scale-105">
                <FaPlusCircle className='fill-slate-600 w-8 h-8 transition ease-in-out duration-300 group-hover:fill-slate-900 group-hover:opacity-75' />
            </button>
        </div>
    </div>
}