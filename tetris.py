import pygame
import random

# 初始化 Pygame
pygame.init()

# 设置游戏窗口
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
BLOCK_SIZE = 30

# 游戏区域大小
GRID_WIDTH = 10
GRID_HEIGHT = 20

# 计算游戏区域的实际像素大小
PLAY_WIDTH = GRID_WIDTH * BLOCK_SIZE
PLAY_HEIGHT = GRID_HEIGHT * BLOCK_SIZE

# 计算游戏区域的起始位置（居中）
PLAY_X = (WINDOW_WIDTH - PLAY_WIDTH) // 2
PLAY_Y = (WINDOW_HEIGHT - PLAY_HEIGHT) // 2

# 预览区域位置
PREVIEW_X = PLAY_X + PLAY_WIDTH + 50
PREVIEW_Y = PLAY_Y + 100

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
CYAN = (0, 255, 255)
YELLOW = (255, 255, 0)
MAGENTA = (255, 0, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
ORANGE = (255, 165, 0)
GRAY = (128, 128, 128)

# 定义方块形状
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[1, 1, 1], [0, 1, 0]],  # T
    [[1, 1, 1], [1, 0, 0]],  # L
    [[1, 1, 1], [0, 0, 1]],  # J
    [[1, 1, 0], [0, 1, 1]],  # S
    [[0, 1, 1], [1, 1, 0]]  # Z
]

# 定义方块颜色
SHAPE_COLORS = [CYAN, YELLOW, MAGENTA, ORANGE, BLUE, GREEN, RED]

class Piece:
    def __init__(self, shape_index=None):
        self.shape = shape_index if shape_index is not None else random.randint(0, len(SHAPES) - 1)
        self.color = SHAPE_COLORS[self.shape]
        self.rotation = 0
        self.x = GRID_WIDTH // 2 - len(SHAPES[self.shape][0]) // 2
        self.y = 0
        self.shape_matrix = SHAPES[self.shape]

    def get_shape(self):
        return self.shape_matrix

    def rotate(self):
        # 转置矩阵
        rotated = list(zip(*self.shape_matrix[::-1]))
        # 转换为列表
        rotated = [list(row) for row in rotated]
        return rotated

def create_grid():
    return [[BLACK for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]

def draw_grid(surface, grid):
    for i in range(GRID_HEIGHT):
        for j in range(GRID_WIDTH):
            pygame.draw.rect(surface, grid[i][j],
                           (PLAY_X + j * BLOCK_SIZE,
                            PLAY_Y + i * BLOCK_SIZE,
                            BLOCK_SIZE, BLOCK_SIZE), 0)
            pygame.draw.rect(surface, GRAY,
                           (PLAY_X + j * BLOCK_SIZE,
                            PLAY_Y + i * BLOCK_SIZE,
                            BLOCK_SIZE, BLOCK_SIZE), 1)

def draw_piece(surface, piece, x=None, y=None):
    shape_matrix = piece.get_shape()
    for i, row in enumerate(shape_matrix):
        for j, cell in enumerate(row):
            if cell:
                draw_x = x if x is not None else PLAY_X + (piece.x + j) * BLOCK_SIZE
                draw_y = y if y is not None else PLAY_Y + (piece.y + i) * BLOCK_SIZE
                pygame.draw.rect(surface, piece.color,
                               (draw_x + j * BLOCK_SIZE,
                                draw_y + i * BLOCK_SIZE,
                                BLOCK_SIZE, BLOCK_SIZE), 0)

def valid_move(piece, grid, x=0, y=0, rotated_matrix=None):
    shape_matrix = rotated_matrix if rotated_matrix else piece.get_shape()
    for i, row in enumerate(shape_matrix):
        for j, cell in enumerate(row):
            if cell:
                new_x = piece.x + j + x
                new_y = piece.y + i + y
                if new_x < 0 or new_x >= GRID_WIDTH or new_y >= GRID_HEIGHT:
                    return False
                if new_y >= 0 and grid[new_y][new_x] != BLACK:
                    return False
    return True

def lock_piece(piece, grid):
    shape_matrix = piece.get_shape()
    for i, row in enumerate(shape_matrix):
        for j, cell in enumerate(row):
            if cell:
                if piece.y + i >= 0:
                    grid[piece.y + i][piece.x + j] = piece.color
    return check_lines(grid)

def check_lines(grid):
    lines_cleared = 0
    for i in range(len(grid)-1, -1, -1):
        if BLACK not in grid[i]:
            lines_cleared += 1
            for j in range(i, 0, -1):
                grid[j] = grid[j-1][:]
            grid[0] = [BLACK for _ in range(GRID_WIDTH)]
    return lines_cleared

def draw_score(surface, score, high_score, level):
    font = pygame.font.Font(None, 36)
    score_text = font.render(f'分数: {score}', True, WHITE)
    high_score_text = font.render(f'最高分: {high_score}', True, WHITE)
    level_text = font.render(f'等级: {level}', True, WHITE)
    surface.blit(score_text, (PLAY_X + PLAY_WIDTH + 10, PLAY_Y))
    surface.blit(high_score_text, (PLAY_X + PLAY_WIDTH + 10, PLAY_Y + 40))
    surface.blit(level_text, (PLAY_X + PLAY_WIDTH + 10, PLAY_Y + 80))

def draw_next_piece(surface, piece):
    font = pygame.font.Font(None, 36)
    next_text = font.render('下一个:', True, WHITE)
    surface.blit(next_text, (PREVIEW_X, PREVIEW_Y - 30))
    draw_piece(surface, piece, PREVIEW_X, PREVIEW_Y)

def draw_controls(surface):
    font = pygame.font.Font(None, 24)
    controls = [
        "游戏控制:",
        "←→: 左右移动",
        "↑: 旋转",
        "↓: 加速下落",
        "空格: 直接下落",
        "P: 暂停游戏",
        "R: 重新开始"
    ]
    for i, text in enumerate(controls):
        control_text = font.render(text, True, WHITE)
        surface.blit(control_text, (20, PLAY_Y + i * 30))

def game_over(grid):
    return any(cell != BLACK for cell in grid[0])

def hard_drop(piece, grid):
    while valid_move(piece, grid, y=1):
        piece.y += 1
    return piece.y

# 创建游戏窗口
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("俄罗斯方块")

# 初始化游戏变量
grid = create_grid()
current_piece = Piece()
next_piece = Piece()
clock = pygame.time.Clock()
fall_time = 0
fall_speed = 0.5  # 初始下落速度
score = 0
high_score = 0
level = 1
paused = False

# 游戏主循环
running = True
game_over_state = False

while running:
    # 根据分数调整游戏速度
    level = min(10, score // 1000 + 1)  # 每1000分提升一级，最高10级
    fall_speed = max(0.1, 0.5 - (level - 1) * 0.05)  # 速度随等级提升

    fall_time += clock.get_rawtime()
    clock.tick(60)

    if not game_over_state and not paused:
        if fall_time/1000 >= fall_speed:
            fall_time = 0
            if valid_move(current_piece, grid, y=1):
                current_piece.y += 1
            else:
                lines = lock_piece(current_piece, grid)
                score += lines * 100 * level  # 分数与等级相乘
                if score > high_score:
                    high_score = score
                current_piece = next_piece
                next_piece = Piece()
                if not valid_move(current_piece, grid):
                    game_over_state = True

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_p and not game_over_state:
                paused = not paused
            
            if not game_over_state and not paused:
                if event.key == pygame.K_LEFT:
                    if valid_move(current_piece, grid, x=-1):
                        current_piece.x -= 1
                elif event.key == pygame.K_RIGHT:
                    if valid_move(current_piece, grid, x=1):
                        current_piece.x += 1
                elif event.key == pygame.K_DOWN:
                    if valid_move(current_piece, grid, y=1):
                        current_piece.y += 1
                elif event.key == pygame.K_UP:
                    rotated_matrix = current_piece.rotate()
                    if valid_move(current_piece, grid, rotated_matrix=rotated_matrix):
                        current_piece.shape_matrix = rotated_matrix
                elif event.key == pygame.K_SPACE:
                    current_piece.y = hard_drop(current_piece, grid)
            
            if event.key == pygame.K_r and game_over_state:
                # 重置游戏
                grid = create_grid()
                current_piece = Piece()
                next_piece = Piece()
                score = 0
                level = 1
                game_over_state = False
                paused = False
    
    # 填充黑色背景
    screen.fill(BLACK)
    
    # 绘制游戏网格
    draw_grid(screen, grid)
    
    # 绘制当前方块
    if not game_over_state:
        draw_piece(screen, current_piece)
    
    # 绘制游戏区域边框
    pygame.draw.rect(screen, WHITE, (PLAY_X, PLAY_Y, PLAY_WIDTH, PLAY_HEIGHT), 2)
    
    # 绘制分数和等级
    draw_score(screen, score, high_score, level)
    
    # 绘制下一个方块预览
    draw_next_piece(screen, next_piece)
    
    # 绘制控制说明
    draw_controls(screen)

    # 绘制游戏结束或暂停文字
    if game_over_state:
        font = pygame.font.Font(None, 48)
        game_over_text = font.render('游戏结束! 按R重新开始', True, RED)
        text_rect = game_over_text.get_rect(center=(WINDOW_WIDTH/2, WINDOW_HEIGHT/2))
        screen.blit(game_over_text, text_rect)
    elif paused:
        font = pygame.font.Font(None, 48)
        pause_text = font.render('游戏暂停! 按P继续', True, WHITE)
        text_rect = pause_text.get_rect(center=(WINDOW_WIDTH/2, WINDOW_HEIGHT/2))
        screen.blit(pause_text, text_rect)
    
    # 更新显示
    pygame.display.flip()

# 退出游戏
pygame.quit()

