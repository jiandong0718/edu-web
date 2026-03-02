import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { login } from '@/api/auth';
import { useUserStore } from '@/stores';

interface LoginFormValues {
  username: string;
  password: string;
}

// 粒子动画背景组件
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? '#00d4ff' : '#0099ff';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // 鼠标交互
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.x -= dx * 0.02;
          this.y -= dy * 0.02;
        }

        // 边界检测
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.globalAlpha = this.opacity;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }
    }

    const init = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(0, 212, 255, ${0.15 * (1 - dist / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制渐变背景
      const gradient = ctx!.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, '#0f1a2e');
      gradient.addColorStop(1, '#0a0e17');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制粒子
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();

      // 绘制光晕效果
      const glowGradient = ctx!.createRadialGradient(
        canvas.width / 2,
        canvas.height / 3,
        0,
        canvas.width / 2,
        canvas.height / 3,
        300
      );
      glowGradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
      glowGradient.addColorStop(1, 'transparent');
      ctx!.fillStyle = glowGradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    resize();
    init();
    animate();

    window.addEventListener('resize', () => {
      resize();
      init();
    });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

// 样式定义
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  loginCard: {
    width: 420,
    padding: '48px 40px',
    background: 'rgba(17, 24, 39, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    border: '1px solid rgba(0, 212, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 212, 255, 0.1)',
    position: 'relative' as const,
    zIndex: 10,
    animation: 'cardFloat 0.6s ease-out',
  },
  logoContainer: {
    textAlign: 'center' as const,
    marginBottom: 40,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 153, 255, 0.2) 100%)',
    border: '2px solid rgba(0, 212, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #00d4ff 100%)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'gradientShift 3s ease infinite',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
  formItem: {
    marginBottom: 24,
  },
  input: {
    height: 48,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 8,
    color: '#fff',
  },
  loginButton: {
    width: '100%',
    height: 48,
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.4)',
    transition: 'all 0.3s ease',
  },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setUserInfo } = useUserStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await login(values);
      setToken(response.token);
      setUserInfo(response.userInfo);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ParticleBackground />
      <div style={styles.loginCard}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <SafetyOutlined style={{ fontSize: 40, color: '#00d4ff' }} />
          </div>
          <h1 style={styles.title}>教育管理系统</h1>
          <p style={styles.subtitle}>Education Management System</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
            style={styles.formItem}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}
              placeholder="用户名"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            style={styles.formItem}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}
              placeholder="密码"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={styles.loginButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>

      <style>{`
        @keyframes cardFloat {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 50px rgba(0, 212, 255, 0.6);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
