namespace TasksTracker.Api.Core.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(string id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> CreateAsync(T entity);
    Task<bool> UpdateAsync(string id, T entity);
    Task<bool> DeleteAsync(string id);
}
