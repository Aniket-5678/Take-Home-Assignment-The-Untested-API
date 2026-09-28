const taskService = require('../src/services/taskService');

describe('Task Service', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('should create a new task', () => {
    const task = taskService.create({
      title: 'Learn Jest',
      description: 'Practice testing',
      priority: 'high',
    });

    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Learn Jest');
    expect(task.description).toBe('Practice testing');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('high');
    expect(task.completedAt).toBeNull();
  });

  test('should find a task by id', () => {
    const createdTask = taskService.create({
      title: 'Find Me',
    });

    const task = taskService.findById(createdTask.id);

    expect(task).not.toBeUndefined();
    expect(task.id).toBe(createdTask.id);
    expect(task.title).toBe('Find Me');
  });

  test('should return all tasks', () => {
    taskService.create({
      title: 'Task One',
    });

    taskService.create({
      title: 'Task Two',
    });

    const tasks = taskService.getAll();

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task One');
    expect(tasks[1].title).toBe('Task Two');
  });

  test('should return tasks by status', () => {
    taskService.create({
      title: 'Todo Task',
      status: 'todo',
    });

    taskService.create({
      title: 'In Progress Task',
      status: 'in_progress',
    });

    const tasks = taskService.getByStatus('todo');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Todo Task');
    expect(tasks[0].status).toBe('todo');
  });

  test('should not return tasks for a partial status match', () => {
    taskService.create({
      title: 'Todo Task',
      status: 'todo',
    });

    const tasks = taskService.getByStatus('o');

    expect(tasks).toHaveLength(0);
  });
  
   

  

  test('should return paginated tasks', () => {
    taskService.create({
      title: 'Task One',
    });

    taskService.create({
      title: 'Task Two',
    });

    taskService.create({
      title: 'Task Three',
    });

    const tasks = taskService.getPaginated(1, 2);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task One');
    expect(tasks[1].title).toBe('Task Two');
  });
test('should return correct task statistics', () => {
  taskService.create({
    title: 'Todo Task',
    status: 'todo',
  });

  taskService.create({
    title: 'In Progress Task',
    status: 'in_progress',
  });

  taskService.create({
    title: 'Done Task',
    status: 'done',
  });

  taskService.create({
    title: 'Overdue Task',
    status: 'todo',
    dueDate: '2025-01-01',
  });

  const stats = taskService.getStats();

  expect(stats.todo).toBe(2);
  expect(stats.in_progress).toBe(1);
  expect(stats.done).toBe(1);
  expect(stats.overdue).toBe(1);
});

test('should update an existing task', () => {
  const task = taskService.create({
    title: 'Original Title',
    priority: 'low',
  });

  const updatedTask = taskService.update(task.id, {
    title: 'Updated Title',
    priority: 'high',
  });

  expect(updatedTask).not.toBeNull();
  expect(updatedTask.id).toBe(task.id);
  expect(updatedTask.title).toBe('Updated Title');
  expect(updatedTask.priority).toBe('high');
});

test('should return null when updating a non-existing task', () => {
  const updatedTask = taskService.update('invalid-id', {
    title: 'Updated Title',
  });

  expect(updatedTask).toBeNull();
});

test('should remove an existing task', () => {
  const task = taskService.create({
    title: 'Task to Delete',
  });

  const result = taskService.remove(task.id);

  expect(result).toBe(true);
  expect(taskService.findById(task.id)).toBeUndefined();
});


test('should return false when removing a non-existing task', () => {
  const result = taskService.remove('invalid-id');

  expect(result).toBe(false);
});


test('should complete an existing task', () => {
  const task = taskService.create({
    title: 'Task to Complete',
    priority: 'high',
  });

  const completedTask = taskService.completeTask(task.id);

  expect(completedTask).not.toBeNull();
  expect(completedTask.id).toBe(task.id);
  expect(completedTask.status).toBe('done');
  expect(completedTask.completedAt).not.toBeNull();
});

test('should return null when completing a non-existing task', () => {
  const result = taskService.completeTask('invalid-id');

  expect(result).toBeNull();
});
});