import Log from "../models/LogModel";

async function logAction(user: string, action: string, targetType: string, targetId: string, message: string) {
  const log = new Log({
    user,
    action,
    targetType,
    targetId,
    message,
  });
  await log.save();
}

export default logAction;