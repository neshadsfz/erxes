import { Tasks, Stages } from '../../../db/models';
import { graphqlPubsub } from '../../../pubsub';
import { sendError, sendSuccess } from './utils';

export const receiveRpcMessageTasks = async (action, doc) => {
  if (action === 'add-task') {
    try {
      const task = await Tasks.createTask({ ...doc });

      const stage = await Stages.getStage(task.stageId);

      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: stage.pipelineId,
          proccessId: doc.proccessId,
          action: 'itemAdd',
          data: {
            task,
            aboveItemId: doc.aboveItemId,
            destinationStageId: stage._id
          }
        }
      });

      return sendSuccess({ task });
    } catch (e) {
      return sendError(e.message);
    }
  }

  if (action === 'remove-task') {
    try {
      const task = await Tasks.findOne({ ...doc });
      if (!task) {
        return sendError('Task not found');
      }

      const stage = await Stages.getStage(task.stageId);

      const result = await Tasks.removeTasks([task._id]);

      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: stage.pipelineId,
          proccessId: Math.random,
          action: 'itemsRemove',
          data: {
            task,
            destinationStageId: stage._id
          }
        }
      });

      return sendSuccess({ ...result });
    } catch (e) {
      return sendError(e.message);
    }
  }
};
