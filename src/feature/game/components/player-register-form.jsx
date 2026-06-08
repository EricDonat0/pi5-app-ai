import { Controller, useForm } from 'react-hook-form';
import { registerPlayer } from '../api';
import { cn } from '../../../core/helpers';
import { useGameContext } from '../context/game-context';
import { useEffect } from 'react';

export function PlayerRegisterForm() {
  const { player, setPlayer } = useGameContext();

  // Aqui nós removemos os textos falsos e deixamos apenas as strings vazias ('')
  const form = useForm({
    defaultValues: {
      ai_player_name: player?.ai_player_name || '',
      ai_player_avatar: player?.ai_player_avatar || '',
      group_name: player?.group_name || '',
      ai_player_description: player?.ai_player_description || '',
      ai_player_move_endpoint: player?.ai_player_move_endpoint || '',
    },
  });
  const { formState } = form;
  const { isSubmitting, errors } = formState;

  async function handleSubmit(dto) {
    try {
      const response = await registerPlayer({
        ...dto,
      });

      if (!response?.player_access_token) {
        throw new Error('[ERR]: resposta inesperada ao registrar jogador');
      }

      setPlayer(response);

      form?.reset({
        ai_player_name: response?.ai_player_name,
        ai_player_avatar: response?.ai_player_avatar,
        group_name: response?.group_name,
        ai_player_description: response?.ai_player_description,
        ai_player_move_endpoint: response?.ai_player_move_endpoint,
      });

      // MUDAMOS ESTA LINHA PARA EXIBIR OS DADOS NA TELA:
      alert(`IA Registrada com Sucesso!\n\nID do Bot: ${response.id}\nToken de Acesso: ${response.player_access_token}\n\nGuarde o ID e o Token para usar na Arena!`);

    } catch (err) {
      console.error(err?.message || '[ERR]: erro ao registrar jogador', err);
      alert("Ops! Erro ao registrar o bot. Verifique o console (F12) para mais detalhes.");
    }
  }

  useEffect(() => {
    if (player?.id) {
      // Aqui também limpamos os textos de placeholder
      form.reset({
        ai_player_name: player?.ai_player_name || '',
        ai_player_avatar: player?.ai_player_avatar || '',
        group_name: player?.group_name || '',
        ai_player_description: player?.ai_player_description || '',
        ai_player_move_endpoint: player?.ai_player_move_endpoint || '',
      });
    }
  }, [player, form]);

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className={cn('flex flex-col gap-4')}
      style={{ width: "100%" }}
    >
      <Controller
        name={'group_name'}
        control={form.control}
        rules={{ required: 'O nome do grupo é obrigatório' }}
        render={({ field }) => (
          <div style={{ marginBottom: "15px" }}>
            <label className="player-select-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              Nome do grupo
            </label>
            <input
              className="player-select-dropdown"
              style={{ width: "100%", boxSizing: "border-box" }}
              type={'text'}
              placeholder="Ex: Os Palermas"
              {...field}
            />
            {errors.group_name && (
              <span style={{ color: "#ff4757", fontSize: "0.8rem", marginTop: "5px", display: "block" }}>
                {errors.group_name.message}
              </span>
            )}
          </div>
        )}
      />

      <Controller
        name={'ai_player_name'}
        control={form.control}
        rules={{ required: 'O nome do jogador de IA é obrigatório' }}
        render={({ field }) => (
          <div style={{ marginBottom: "15px" }}>
            <label className="player-select-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              Nome do jogador
            </label>
            <input
              className="player-select-dropdown"
              style={{ width: "100%", boxSizing: "border-box" }}
              type={'text'}
              placeholder="Ex: PalermaBot"
              {...field}
            />
            {errors.ai_player_name && (
              <span style={{ color: "#ff4757", fontSize: "0.8rem", marginTop: "5px", display: "block" }}>
                {errors.ai_player_name.message}
              </span>
            )}
          </div>
        )}
      />

      <Controller
        name={'ai_player_avatar'}
        control={form.control}
        rules={{ required: 'A URL do avatar do jogador de IA é obrigatória' }}
        render={({ field }) => (
          <div style={{ marginBottom: "15px" }}>
            <label className="player-select-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              URL do avatar
            </label>
            <input
              className="player-select-dropdown"
              style={{ width: "100%", boxSizing: "border-box" }}
              type={'text'}
              placeholder="Ex: https://meusite.com/foto.png"
              {...field}
            />
            {errors.ai_player_avatar && (
              <span style={{ color: "#ff4757", fontSize: "0.8rem", marginTop: "5px", display: "block" }}>
                {errors.ai_player_avatar.message}
              </span>
            )}
          </div>
        )}
      />

      <Controller
        name={'ai_player_description'}
        control={form.control}
        render={({ field }) => (
          <div style={{ marginBottom: "15px" }}>
            <label className="player-select-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              Descrição do jogador
            </label>
            <input
              className="player-select-dropdown"
              style={{ width: "100%", boxSizing: "border-box" }}
              type={'text'}
              placeholder="Ex: IA especializada em defender..."
              {...field}
            />
            {errors.ai_player_description && (
              <span style={{ color: "#ff4757", fontSize: "0.8rem", marginTop: "5px", display: "block" }}>
                {errors.ai_player_description.message}
              </span>
            )}
          </div>
        )}
      />

      <Controller
        name={'ai_player_move_endpoint'}
        control={form.control}
        rules={{
          required: 'O endpoint de movimento do jogador de IA é obrigatório',
        }}
        render={({ field }) => (
          <div style={{ marginBottom: "25px" }}>
            <label className="player-select-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              Endpoint de movimento (URL do Railway)
            </label>
            <input
              className="player-select-dropdown"
              style={{ width: "100%", boxSizing: "border-box" }}
              type={'text'}
              placeholder="Ex: https://sua-api.up.railway.app/move"
              {...field}
            />
            {errors.ai_player_move_endpoint && (
              <span style={{ color: "#ff4757", fontSize: "0.8rem", marginTop: "5px", display: "block" }}>
                {errors.ai_player_move_endpoint.message}
              </span>
            )}
          </div>
        )}
      />

      <button
        type={'submit'}
        disabled={isSubmitting}
        className="cta-button btn-danger"
        style={{ width: "100%", padding: "15px", marginTop: "10px" }}
      >
        {isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR JOGADOR'}
      </button>
    </form>
  );
}