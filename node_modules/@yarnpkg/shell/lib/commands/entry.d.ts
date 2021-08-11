import { Command, Usage } from 'clipanion';
export default class EntryCommand extends Command {
    commandName: string;
    args: Array<string>;
    cwd: string;
    static usage: Usage;
    execute(): Promise<number>;
}
