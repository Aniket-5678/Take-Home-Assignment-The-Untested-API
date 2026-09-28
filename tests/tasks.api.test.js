const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('GET /tasks should return all tasks', async () => {
    const response = await request(app)
      .get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('POST /tasks should create a new task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Learn Supertest',
        description: 'Practice API testing',
        priority: 'high',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Learn Supertest');
    expect(response.body.description).toBe('Practice API testing');
    expect(response.body.priority).toBe('high');
    expect(response.body.status).toBe('todo');
  });


  test('POST /tasks should return 400 when title is missing', async () => {
  const response = await request(app)
    .post('/tasks')
    .send({
      description: 'Task without title',
      priority: 'high',
    });

  expect(response.statusCode).toBe(400);
  expect(response.body).toEqual({
    error: 'title is required and must be a non-empty string',
  });
});

test('POST /tasks should return 400 for invalid priority', async () => {
  const response = await request(app)
    .post('/tasks')
    .send({
      title: 'Invalid Priority Task',
      priority: 'urgent',
    });

  expect(response.statusCode).toBe(400);
  expect(response.body).toEqual({
    error: 'priority must be one of: low, medium, high',
  });
});

test('GET /tasks?status=todo should return tasks with matching status', async () => {
  await request(app)
    .post('/tasks')
    .send({
      title: 'Todo Task',
      status: 'todo',
    });

  await request(app)
    .post('/tasks')
    .send({
      title: 'In Progress Task',
      status: 'in_progress',
    });

  const response = await request(app)
    .get('/tasks?status=todo');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(1);
  expect(response.body[0].title).toBe('Todo Task');
  expect(response.body[0].status).toBe('todo');
});

test('GET /tasks?status=o should not return tasks for a partial status match', async () => {
  await request(app)
    .post('/tasks')
    .send({
      title: 'Todo Task',
      status: 'todo',
    });

  const response = await request(app)
    .get('/tasks?status=o');

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual([]);
});

test('GET /tasks?page=1&limit=2 should return the first two tasks', async () => {
  await request(app)
    .post('/tasks')
    .send({ title: 'Task One' });

  await request(app)
    .post('/tasks')
    .send({ title: 'Task Two' });

  await request(app)
    .post('/tasks')
    .send({ title: 'Task Three' });

  const response = await request(app)
    .get('/tasks?page=1&limit=2');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(2);
  expect(response.body[0].title).toBe('Task One');
  expect(response.body[1].title).toBe('Task Two');
});
test('GET /tasks/stats should return task statistics', async () => {
  await request(app)
    .post('/tasks')
    .send({
      title: 'Todo Task',
      status: 'todo',
    });

  await request(app)
    .post('/tasks')
    .send({
      title: 'In Progress Task',
      status: 'in_progress',
    });

  await request(app)
    .post('/tasks')
    .send({
      title: 'Done Task',
      status: 'done',
    });

  const response = await request(app)
    .get('/tasks/stats');

  expect(response.statusCode).toBe(200);
  expect(response.body.todo).toBe(1);
  expect(response.body.in_progress).toBe(1);
  expect(response.body.done).toBe(1);
  expect(response.body.overdue).toBe(0);
});
test('PUT /tasks/:id should update an existing task', async () => {
  const createResponse = await request(app)
    .post('/tasks')
    .send({
      title: 'Original Task',
      priority: 'low',
    });

  const taskId = createResponse.body.id;

  const response = await request(app)
    .put(`/tasks/${taskId}`)
    .send({
      title: 'Updated Task',
      priority: 'high',
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.id).toBe(taskId);
  expect(response.body.title).toBe('Updated Task');
  expect(response.body.priority).toBe('high');
});

test('PUT /tasks/:id should return 404 for a non-existing task', async () => {
  const response = await request(app)
    .put('/tasks/does-not-exist')
    .send({
      title: 'Updated Task',
    });

  expect(response.statusCode).toBe(404);
  expect(response.body).toEqual({
    error: 'Task not found',
  });
});

test('PUT /tasks/:id should return 400 for invalid priority', async () => {
  const createResponse = await request(app)
    .post('/tasks')
    .send({
      title: 'Test Task',
      priority: 'low',
    });

  const taskId = createResponse.body.id;

  const response = await request(app)
    .put(`/tasks/${taskId}`)
    .send({
      priority: 'urgent',
    });

  expect(response.statusCode).toBe(400);
  expect(response.body).toEqual({
    error: 'priority must be one of: low, medium, high',
  });
});

test('DELETE /tasks/:id should delete an existing task', async () => {
  const createResponse = await request(app)
    .post('/tasks')
    .send({
      title: 'Task to Delete',
    });

  const taskId = createResponse.body.id;

  const response = await request(app)
    .delete(`/tasks/${taskId}`);

  expect(response.statusCode).toBe(204);
  expect(response.body).toEqual({});

  const getResponse = await request(app)
    .get('/tasks');

  expect(getResponse.statusCode).toBe(200);
  expect(getResponse.body).toEqual([]);
});

test('DELETE /tasks/:id should return 404 for a non-existing task', async () => {
  const response = await request(app)
    .delete('/tasks/does-not-exist');

  expect(response.statusCode).toBe(404);
  expect(response.body).toEqual({
    error: 'Task not found',
  });
});

test('PATCH /tasks/:id/complete should complete an existing task', async () => {
  const createResponse = await request(app)
    .post('/tasks')
    .send({
      title: 'Task to Complete',
      priority: 'high',
    });

  const taskId = createResponse.body.id;

  const response = await request(app)
    .patch(`/tasks/${taskId}/complete`);

  expect(response.statusCode).toBe(200);
  expect(response.body.id).toBe(taskId);
  expect(response.body.status).toBe('done');
  expect(response.body.completedAt).not.toBeNull();
});

test('PATCH /tasks/:id/complete should return 404 for a non-existing task', async () => {
  const response = await request(app)
    .patch('/tasks/does-not-exist/complete');

  expect(response.statusCode).toBe(404);
  expect(response.body).toEqual({
    error: 'Task not found',
  });
});

test('PATCH /tasks/:id/assign should assign a task to a user', async () => {
  const createResponse = await request(app)
    .post('/tasks')
    .send({
      title: 'Task to Assign',
    });

  const taskId = createResponse.body.id;

  const response = await request(app)
    .patch(`/tasks/${taskId}/assign`)
 .send({
  assignee: 'user-123',
});

  expect(response.statusCode).toBe(200);
  expect(response.body.id).toBe(taskId);
 expect(response.body.assignee).toBe('user-123');
});

test('PATCH /tasks/:id/assign should return 400 when assignee is missing', async () => {
  const createResponse = await request(app)
    .post('/tasks')
    .send({
      title: 'Task Without Assignee',
    });

  const taskId = createResponse.body.id;

  const response = await request(app)
    .patch(`/tasks/${taskId}/assign`)
    .send({});

  expect(response.statusCode).toBe(400);
  expect(response.body).toEqual({
  error: 'assignee is required and must be a non-empty string',
  });
});


test('PATCH /tasks/:id/assign should return 400 for an empty assignee', async () => {
  const createResponse = await request(app)
    .post('/tasks')
    .send({
      title: 'Task With Empty Assignee',
    });

  const taskId = createResponse.body.id;

  const response = await request(app)
    .patch(`/tasks/${taskId}/assign`)
 .send({
  assignee: '   ',
});

  expect(response.statusCode).toBe(400);
  expect(response.body).toEqual({
  error: 'assignee is required and must be a non-empty string'
  });
});

test('PATCH /tasks/:id/assign should return 404 for a non-existing task', async () => {
  const response = await request(app)
    .patch('/tasks/does-not-exist/assign')
   .send({
  assignee: 'user-123',
});

  expect(response.statusCode).toBe(404);
  expect(response.body).toEqual({
    error: 'Task not found',
  });
});

test('PATCH /tasks/:id/assign should return 400 when task is already assigned', async () => {
  const createResponse = await request(app)
    .post('/tasks')
    .send({
      title: 'Already Assigned Task',
    });

  const taskId = createResponse.body.id;

  await request(app)
    .patch(`/tasks/${taskId}/assign`)
    .send({
      assignee: 'user-123',
    });

  const response = await request(app)
    .patch(`/tasks/${taskId}/assign`)
    .send({
      assignee: 'user-456',
    });

  expect(response.statusCode).toBe(400);
  expect(response.body).toEqual({
    error: 'Task is already assigned',
  });
});
});